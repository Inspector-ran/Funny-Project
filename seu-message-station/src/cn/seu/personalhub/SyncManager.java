package cn.seu.personalhub;
import android.app.job.*;
import android.content.*;
import android.os.*;
import org.json.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

public final class SyncManager {
  public interface Completion{void finished(JSONObject report);}
  private static final Object LOCK=new Object();
  private static final ExecutorService EXECUTOR=Executors.newSingleThreadExecutor();
  private static final Handler MAIN=new Handler(Looper.getMainLooper());
  private static boolean running=false;private static JSONObject lastReport;
  private static long messageRevision=0;
  private static final Set<String> busy=new LinkedHashSet<>();
  private static final List<Completion> listeners=new ArrayList<>();
  private static NativeHttp transport;private static Future<?> future;private static String activeTrigger="";
  public static JSONObject start(Context ctx,String filter,String trigger,Completion completion){
    final Context context=ctx.getApplicationContext();synchronized(LOCK){
      if(completion!=null)listeners.add(completion);
      if(running)return answer(false);
      if(completion==null&&filter.isEmpty()&&Arrays.asList("resume","open","timer").contains(trigger)&&lastReport!=null){try{if(System.currentTimeMillis()-Instant.parse(lastReport.getString("finished_at")).toEpochMilli()<60000)return answer(false);}catch(Exception ignored){}}
      running=true;activeTrigger=trigger;busy.clear();transport=new NativeHttp();
      future=EXECUTOR.submit(()->run(context,filter,trigger));return answer(true);
    }
  }
  private static JSONObject answer(boolean started){try{return SyncCore.object("started",started,"fullSync",running);}catch(Exception e){return new JSONObject();}}
  private static void run(Context context,String filter,String trigger){
    HubBridge storage=new HubBridge(context,null,null);JSONObject report;
    SyncCore.Repository repo=new SyncCore.Repository(){public JSONArray list(String kind)throws Exception{return new JSONArray(storage.read(kind));}public void put(String kind,String id,JSONObject data,boolean merge)throws Exception{JSONObject result=new JSONObject(storage.apply(new JSONArray().put(SyncCore.object("op",merge?"merge":"put","kind",kind,"id",id,"data",data)).toString()));if(result.has("error"))throw new Exception(result.getString("error"));}public String secret(String name){return storage.getSecret(name);}};
    try{
      report=new SyncCore(repo,transport,new SyncCore.Observer(){
        public void source(String id,boolean active){synchronized(LOCK){if(active)busy.add(id);else busy.remove(id);}}
        public void message(){synchronized(LOCK){messageRevision++;}}
      }).run(filter,trigger);
    }catch(Exception e){try{report=SyncCore.object("status","error","finished_at",Instant.now().toString(),"trigger",trigger,"added",0,"updated",0,"successful",0,"failed",1,"error",SyncCore.explain(e),"results",new JSONArray());}catch(Exception ignored){report=new JSONObject();}}
    try{repo.put("settings","last-sync",SyncCore.object("id","last-sync","value",report),false);}catch(Exception ignored){}
    try{storage.close();}catch(Exception ignored){}List<Completion> callbacks;
    synchronized(LOCK){lastReport=report;running=false;busy.clear();transport=null;future=null;callbacks=new ArrayList<>(listeners);listeners.clear();}
    final JSONObject finalReport=report;for(Completion callback:callbacks)MAIN.post(()->callback.finished(finalReport));
  }
  public static JSONObject status(Context context){synchronized(LOCK){
    if(lastReport==null){HubBridge storage=new HubBridge(context,null,null);try{JSONArray settings=new JSONArray(storage.read("settings"));for(int i=0;i<settings.length();i++){JSONObject record=settings.getJSONObject(i);if(record.optString("id").equals("last-sync"))lastReport=record.optJSONObject("value");}}catch(Exception ignored){}finally{storage.close();}}
    try{return SyncCore.object("busy",new JSONArray(busy),"fullSync",running,"lastReport",lastReport==null?JSONObject.NULL:lastReport,"messageRevision",messageRevision,"nativeVersion","1.0.5");}catch(Exception e){return new JSONObject();}
  }}
  public static void cancelSystem(){synchronized(LOCK){if(!"system".equals(activeTrigger))return;if(transport!=null)transport.cancel();}}
  public static void schedule(Context context){
    HubBridge storage=new HubBridge(context,null,null);int minutes=30;
    try{JSONArray settings=new JSONArray(storage.read("settings"));for(int i=0;i<settings.length();i++){JSONObject item=settings.getJSONObject(i);if("prefs".equals(item.optString("id")))minutes=item.getJSONObject("value").optInt("publicMinutes",30);}}catch(Exception ignored){}finally{storage.close();}
    long interval=Math.max(15,Math.min(1440,minutes))*60000L;JobScheduler scheduler=(JobScheduler)context.getSystemService(Context.JOB_SCHEDULER_SERVICE);JobInfo existing=scheduler.getPendingJob(3210);
    if(existing!=null&&existing.getIntervalMillis()==interval)return;
    scheduler.schedule(new JobInfo.Builder(3210,new ComponentName(context,SyncJob.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPeriodic(interval,Math.max(5*60000L,interval/5)).setPersisted(true).build());
  }
}
