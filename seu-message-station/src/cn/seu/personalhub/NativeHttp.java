package cn.seu.personalhub;
import java.io.*;
import java.net.*;
import java.nio.charset.Charset;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.*;
public final class NativeHttp implements SyncCore.Transport{
  private final Set<HttpURLConnection> active=ConcurrentHashMap.newKeySet();private volatile boolean cancelled=false;
  public void cancel(){cancelled=true;for(HttpURLConnection c:active)c.disconnect();}
  public String get(String input,Map<String,String> headers)throws Exception{
    String url=input;
    for(int redirect=0;redirect<5;redirect++){
      if(cancelled||Thread.currentThread().isInterrupted())throw new CancellationException();URL target=new URL(url);if(!target.getProtocol().equals("https")&&!target.getProtocol().equals("http"))throw new IOException("无效的来源地址");
      HttpURLConnection c=(HttpURLConnection)target.openConnection();active.add(c);
      try{c.setUseCaches(false);c.setConnectTimeout(12000);c.setReadTimeout(18000);c.setInstanceFollowRedirects(false);c.setRequestProperty("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36");c.setRequestProperty("Accept","application/json,text/html;q=0.9,*/*;q=0.8");c.setRequestProperty("Cache-Control","no-cache");for(Map.Entry<String,String> h:headers.entrySet())c.setRequestProperty(h.getKey(),h.getValue());int status=c.getResponseCode();
        if(status>=300&&status<400&&c.getHeaderField("Location")!=null){String next=new URL(target,c.getHeaderField("Location")).toString();if(!headers.isEmpty()&&!new URL(next).getHost().equals(target.getHost()))throw new IOException("授权来源发生跨域跳转，已停止传递登录信息");url=next;continue;}
        if(status<200||status>=300)throw new IOException("来源返回 HTTP "+status+(status==403?"，当前网络或访问频率可能受限":""));
        ByteArrayOutputStream bytes=new ByteArrayOutputStream();try(InputStream in=c.getInputStream()){byte[] buffer=new byte[8192];int n;while((n=in.read(buffer))!=-1){if(cancelled||Thread.currentThread().isInterrupted())throw new CancellationException();if(bytes.size()+n>8*1024*1024)throw new IOException("来源内容过大");bytes.write(buffer,0,n);}}
        byte[] data=bytes.toByteArray();String type=c.getContentType(),charset="UTF-8";Matcher declared=Pattern.compile("charset\\s*=\\s*['\"]?([a-zA-Z0-9_-]+)",Pattern.CASE_INSENSITIVE).matcher(type==null?"":type);if(declared.find())charset=declared.group(1);else{Matcher meta=Pattern.compile("charset\\s*=\\s*['\"]?([a-zA-Z0-9_-]+)",Pattern.CASE_INSENSITIVE).matcher(new String(data,0,Math.min(data.length,3000),Charset.forName("ISO-8859-1")));if(meta.find())charset=meta.group(1);}try{return new String(data,Charset.forName(charset));}catch(Exception ignored){return new String(data,Charset.forName("UTF-8"));}
      }finally{active.remove(c);c.disconnect();}
    }throw new IOException("来源跳转次数过多");
  }
}
