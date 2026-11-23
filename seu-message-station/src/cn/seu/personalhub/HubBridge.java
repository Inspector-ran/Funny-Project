package cn.seu.personalhub;

import android.content.*;
import android.database.Cursor;
import android.database.sqlite.*;
import android.graphics.Bitmap;
import android.security.keystore.*;
import android.util.Base64;
import android.webkit.*;
import android.os.Handler;
import android.os.Looper;
import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.Charset;
import java.security.KeyStore;
import java.util.*;
import java.util.concurrent.*;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import com.google.zxing.*;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

public final class HubBridge {
  private final Context context;
  private final WebView web;
  private final Store store;
  private final ExecutorService io=Executors.newFixedThreadPool(4);
  private final Runnable finished;
  private final Handler main=new Handler(Looper.getMainLooper());
  public HubBridge(Context c,WebView w,Runnable done){context=c.getApplicationContext();web=w;store=new Store(context);finished=done;}
  private static void kind(String k){if(!Arrays.asList("messages","sources","todos","settings").contains(k))throw new IllegalArgumentException("无效的数据类型");}
  @JavascriptInterface public String seed(){try(InputStream in=context.getAssets().open("public/seed.json")){ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] bytes=new byte[8192];int n;while((n=in.read(bytes))!=-1)out.write(bytes,0,n);return out.toString("UTF-8");}catch(Exception e){return "{}";}}
  @JavascriptInterface public String startSync(String source,String trigger){return SyncManager.start(context,source==null?"":source,trigger==null?"manual":trigger,null).toString();}
  @JavascriptInterface public String syncStatus(){return SyncManager.status(context).toString();}
  @JavascriptInterface public void scheduleSync(){SyncManager.schedule(context);}
  @JavascriptInterface public String read(String k){try{kind(k);JSONArray out=new JSONArray();try(Cursor c=store.getReadableDatabase().rawQuery("SELECT payload FROM entries WHERE kind=?",new String[]{k})){while(c.moveToNext())out.put(new JSONObject(c.getString(0)));}return out.toString();}catch(Exception e){return "[]";}}
  @JavascriptInterface public String apply(String raw){SQLiteDatabase db=store.getWritableDatabase();try{JSONArray ops=new JSONArray(raw);db.beginTransaction();try{for(int i=0;i<ops.length();i++){JSONObject op=ops.getJSONObject(i);String k=op.getString("kind"),id=op.optString("id");kind(k);String action=op.getString("op");if(action.equals("clear")){db.delete("entries","kind=?",new String[]{k});continue;}if(action.equals("delete")){db.delete("entries","kind=? AND id=?",new String[]{k,id});continue;}JSONObject data=op.getJSONObject("data");if(action.equals("flags")){if(!k.equals("messages"))throw new IllegalArgumentException("Invalid flags target");try(Cursor c=db.rawQuery("SELECT payload FROM entries WHERE kind=? AND id=?",new String[]{k,id})){if(!c.moveToFirst())continue;data=MessageFlags.apply(new JSONObject(c.getString(0)),data,op.optJSONObject("expected"));}}if(action.equals("merge")&&k.equals("messages")){try(Cursor c=db.rawQuery("SELECT payload FROM entries WHERE kind=? AND id=?",new String[]{k,id})){if(c.moveToFirst()){data=MessageFlags.keepLocal(new JSONObject(c.getString(0)),data);}}}ContentValues v=new ContentValues();v.put("kind",k);v.put("id",id);v.put("payload",data.toString());if(db.insertWithOnConflict("entries",null,v,SQLiteDatabase.CONFLICT_REPLACE)==-1)throw new IllegalStateException("Database insert failed");}db.setTransactionSuccessful();}finally{db.endTransaction();}return "{}";}catch(Exception e){return "{\"error\":\"本机保存失败，请检查手机剩余空间\"}";}}
  private SecretKey key()throws Exception{KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);String alias="seu-personal-hub";if(!ks.containsAlias(alias)){KeyGenerator g=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");g.init(new KeyGenParameterSpec.Builder(alias,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());g.generateKey();}return (SecretKey)ks.getKey(alias,null);}
  @JavascriptInterface public String getSecret(String name){try{String encoded=context.getSharedPreferences("secrets",0).getString(name,"");if(encoded.isEmpty())return "";byte[] b=Base64.decode(encoded,Base64.NO_WRAP);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Arrays.copyOfRange(b,0,12)));return new String(c.doFinal(Arrays.copyOfRange(b,12,b.length)),"UTF-8");}catch(Exception e){return "";}}
  @JavascriptInterface public boolean setSecret(String name,String value){try{Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key());byte[] encrypted=c.doFinal(value.getBytes("UTF-8")),iv=c.getIV(),all=new byte[iv.length+encrypted.length];System.arraycopy(iv,0,all,0,iv.length);System.arraycopy(encrypted,0,all,iv.length,encrypted.length);return context.getSharedPreferences("secrets",0).edit().putString(name,Base64.encodeToString(all,Base64.NO_WRAP)).commit();}catch(Exception e){return false;}}
  @JavascriptInterface public void request(final String id,final String url,final String method,final String headers,final String body){io.execute(()->{JSONObject result=new JSONObject();HttpURLConnection conn=null;try{URL target=new URL(url);if(!Arrays.asList("http","https").contains(target.getProtocol()))throw new IOException("仅支持网页链接");conn=(HttpURLConnection)target.openConnection();conn.setUseCaches(false);conn.setConnectTimeout(20000);conn.setReadTimeout(url.contains("getLoginInfo")?55000:30000);conn.setInstanceFollowRedirects(false);conn.setRequestMethod(method);conn.setRequestProperty("User-Agent","Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36");JSONObject hs=new JSONObject(headers);Iterator<String> it=hs.keys();while(it.hasNext()){String k=it.next();if(!k.equalsIgnoreCase("host"))conn.setRequestProperty(k,hs.getString(k));}if(!method.equals("GET")&&!method.equals("HEAD")){conn.setDoOutput(true);try(OutputStream out=conn.getOutputStream()){out.write(body.getBytes("UTF-8"));}}int status=conn.getResponseCode();InputStream input=status>=400?conn.getErrorStream():conn.getInputStream();ByteArrayOutputStream bytes=new ByteArrayOutputStream();if(input!=null)try(InputStream in=input){byte[] buf=new byte[8192];int n;while((n=in.read(buf))!=-1){if(bytes.size()+n>8*1024*1024)throw new IOException("页面内容过大");bytes.write(buf,0,n);}}String type=conn.getContentType(),charset="UTF-8";if(type!=null&&type.toLowerCase().contains("charset="))charset=type.substring(type.toLowerCase().indexOf("charset=")+8).split("[; ]")[0];String text;try{text=new String(bytes.toByteArray(),Charset.forName(charset));}catch(Exception ignored){text=new String(bytes.toByteArray(),"UTF-8");}JSONObject responseHeaders=new JSONObject();JSONArray cookies=new JSONArray();for(Map.Entry<String,List<String>> e:conn.getHeaderFields().entrySet()){if(e.getKey()==null)continue;responseHeaders.put(e.getKey().toLowerCase(),e.getValue().get(0));if(e.getKey().equalsIgnoreCase("set-cookie"))for(String s:e.getValue())cookies.put(s);}result.put("status",status).put("text",text).put("headers",responseHeaders).put("cookies",cookies);}catch(Exception e){try{result.put("error",e instanceof SocketTimeoutException?"来源连接超时，请稍后重试":"网络暂不可用："+e.getClass().getSimpleName());}catch(Exception ignored){}}finally{if(conn!=null)conn.disconnect();}final String response=result.toString();main.post(()->{try{web.evaluateJavascript("window.__androidReply("+JSONObject.quote(id)+","+JSONObject.quote(response)+")",null);}catch(Exception ignored){}});});}
  @JavascriptInterface public String qr(String text){try{BitMatrix bits=new QRCodeWriter().encode(text,BarcodeFormat.QR_CODE,320,320);Bitmap bitmap=Bitmap.createBitmap(320,320,Bitmap.Config.ARGB_8888);for(int y=0;y<320;y++)for(int x=0;x<320;x++)bitmap.setPixel(x,y,bits.get(x,y)?0xff000000:0xffffffff);ByteArrayOutputStream out=new ByteArrayOutputStream();bitmap.compress(Bitmap.CompressFormat.PNG,100,out);bitmap.recycle();return "data:image/png;base64,"+Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);}catch(Exception e){return "";}}
  @JavascriptInterface public void openExternal(String raw){try{UriCheck.open(context,raw);}catch(Exception ignored){}}
  @JavascriptInterface public void done(){if(finished!=null)main.post(finished);}
  public void close(){io.shutdownNow();store.close();}
  private static class Store extends SQLiteOpenHelper{Store(Context c){super(c,"hub.sqlite",null,1);setWriteAheadLoggingEnabled(true);}public void onCreate(SQLiteDatabase db){db.execSQL("CREATE TABLE entries(kind TEXT NOT NULL,id TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(kind,id))");}public void onUpgrade(SQLiteDatabase db,int old,int current){}}
}
