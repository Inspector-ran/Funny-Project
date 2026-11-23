package cn.seu.personalhub;
import org.json.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.net.*;
import java.util.concurrent.*;

/** Runs the production sync engine on the JVM, without Android or a WebView. */
public class SyncCoreTest {
  static class Memory implements SyncCore.Repository {
    final Map<String,LinkedHashMap<String,JSONObject>> records=new HashMap<>();
    int messageWrites;
    public synchronized JSONArray list(String kind){JSONArray out=new JSONArray();for(JSONObject v:records.getOrDefault(kind,new LinkedHashMap<>()).values())out.put(new JSONObject(v.toString()));return out;}
    public synchronized void put(String kind,String id,JSONObject value,boolean merge){LinkedHashMap<String,JSONObject> map=records.computeIfAbsent(kind,k->new LinkedHashMap<>());JSONObject v=new JSONObject(value.toString()),old=map.get(id);if(kind.equals("messages")){messageWrites++;if(merge&&old!=null)v.put("read",old.optInt("read")).put("starred",old.optInt("starred"));}map.put(id,v);}
    public String secret(String name){return "";}
    void source(String id,String name,String type)throws Exception{put("sources",id,SyncCore.object("id",id,"name",name,"type",type,"enabled",1,"url","https://jwc.seu.edu.cn/jsgl2/list.htm"),false);}
    JSONObject first(String kind){return list(kind).getJSONObject(0);}
  }
  static void check(boolean ok,String label){if(!ok)throw new AssertionError(label);System.out.println("PASS "+label);}
  static JSONObject run(Memory repo,SyncCore.Transport net)throws Exception{return new SyncCore(repo,net,(id,busy)->{}).run("","manual");}
  static String pool(String title)throws Exception{return SyncCore.object("pageCount",1,"items",new JSONArray().put(SyncCore.object("id","fixture-1","title",title,"summary","集成电路学院活动通知","publishedAt","2026-11-17T01:00:00Z","source",SyncCore.object("name","公众号·东南大学集成电路学院")))).toString();}
  public static void main(String[] args)throws Exception{
    if(args.length>0&&args[0].equals("live")){live(args[1],args.length>2?args[2]:"public");return;}
    Memory repo=new Memory();repo.source("wechat-7","东南大学集成电路学院","wechat");
    JSONObject first=run(repo,(url,h)->pool("新增活动"));check(first.getInt("added")==1&&first.getInt("successful")==1,"native engine imports a new public article");
    JSONObject m=repo.first("messages");m.put("read",1).put("starred",1).put("public_loaded",true).put("html","<p>cached body</p>").put("text","cached body").put("url","https://mp.weixin.qq.com/s/fixture");repo.put("messages",m.getString("id"),m,false);
    int writes=repo.messageWrites;JSONObject second=run(repo,(url,h)->pool("新增活动"));JSONObject kept=repo.first("messages");
    check(second.getInt("added")==0&&second.getInt("updated")==0&&repo.list("messages").length()==1&&repo.messageWrites==writes,"repeat sync adds no duplicates and makes no message writes");
    check(kept.getInt("read")==1&&kept.getInt("starred")==1&&kept.getString("text").equals("cached body")&&kept.getString("url").contains("weixin"),"sync preserves read, favourite and downloaded body");
    JSONObject fail=run(repo,(url,h)->{throw new UnknownHostException("fixture");});
    check(fail.getInt("failed")==1&&repo.list("messages").length()==1&&repo.first("sources").getString("error").contains("网络"),"offline failure retains data and records a useful reason");
    JSONObject malformed=run(repo,(url,h)->"<html>verification page</html>");check(malformed.getString("status").equals("error"),"non-JSON provider responses cannot count as successful sync");
    repo.source("jwc","东南大学教务处","website");String date=java.time.LocalDate.now().toString();
    JSONObject partial=run(repo,(url,h)->{
      if(url.contains("seu.wiki"))throw new SocketTimeoutException();
      if(url.contains("list.htm"))return "<div class='news-list-item'><a href='/2026/1117/c71422a999999/page.htm' title='教务新通知'>教务新通知</a><span>"+date+"</span></div>";
      return "<div class='wp_articlecontent'><p>报名要求</p><img src='/images/test.png'><a href='/files/test.pdf'>附件</a><script>bad()</script></div>";
    });
    check(partial.getString("status").equals("partial")&&partial.getInt("added")==1&&partial.getInt("successful")==1,"public provider failure does not block independent JWC sync");
    JSONObject jwc=null;for(Object item:repo.list("messages")){JSONObject v=(JSONObject)item;if(v.getString("source_id").equals("jwc"))jwc=v;}
    check(jwc!=null&&jwc.getString("html").contains("https://jwc.seu.edu.cn/images/test.png")&&!jwc.getString("html").contains("script")&&jwc.getJSONArray("attachments").length()==1,"JWC body resolves images, retains attachments and removes scripts");
    progressive();System.out.println("ALL FIXTURE CHECKS PASSED");
  }
  static void progressive()throws Exception{
    Memory repo=new Memory();repo.source("jwc","东南大学教务处","website");repo.source("wechat-7","东南大学集成电路学院","wechat");
    LocalDateFixture day=new LocalDateFixture();
    CountDownLatch pendingBody=new CountDownLatch(1),unlockBody=new CountDownLatch(1),savedMessages=new CountDownLatch(2);
    SyncCore core=new SyncCore(repo,(url,headers)->{
      if(url.contains("seu.wiki"))return pool("其他来源新消息");
      if(url.contains("list.htm"))return "<li><a href='/2026/1117/c71422a999999/page.htm'>先显示的教务通知</a> "+day.raw+"</li>";
      pendingBody.countDown();if(!unlockBody.await(10,TimeUnit.SECONDS))throw new SocketTimeoutException();
      return "<div class='wp_articlecontent'><p>稍后送达的正文</p></div>";
    },new SyncCore.Observer(){public void source(String id,boolean active){}public void message(){savedMessages.countDown();}});
    ExecutorService runner=Executors.newSingleThreadExecutor();
    try{
      Future<JSONObject> sync=runner.submit(()->core.run("","manual"));
      check(pendingBody.await(5,TimeUnit.SECONDS)&&savedMessages.await(5,TimeUnit.SECONDS)&&!sync.isDone(),"both sources publish changes while one article body is still blocked");
      JSONObject title=null;for(Object record:repo.list("messages")){JSONObject message=(JSONObject)record;if(message.getString("source_id").equals("jwc"))title=message;}
      check(title!=null&&!title.has("text")&&title.getString("published_at").equals(day.iso),"JWC headline is available before the body and its short date is normalized");
      title.put("read",1).put("starred",1);repo.put("messages",title.getString("id"),title,false);
      unlockBody.countDown();JSONObject result=sync.get(5,TimeUnit.SECONDS);
      JSONObject full=null;for(Object record:repo.list("messages")){JSONObject message=(JSONObject)record;if(message.getString("id").equals(title.getString("id")))full=message;}
      check(result.getInt("added")==2&&result.getInt("updated")==0&&full!=null&&full.getInt("read")==1&&full.getInt("starred")==1&&full.getString("text").contains("稍后送达"),"article body fills the same record without double-counting or clearing read and favourite flags");
    }finally{unlockBody.countDown();runner.shutdownNow();}
  }
  static class LocalDateFixture{
    final java.time.LocalDate date=java.time.LocalDate.now(java.time.ZoneOffset.ofHours(8));
    final String iso=date.toString(),raw=date.getYear()+"/"+date.getMonthValue()+"/"+date.getDayOfMonth();
  }
  static void live(String seedPath,String mode)throws Exception{
    Memory repo=new Memory();JSONObject seed=new JSONObject(new String(Files.readAllBytes(Paths.get(seedPath)),StandardCharsets.UTF_8));JSONArray messages=seed.getJSONArray("messages");for(int i=0;i<messages.length();i++){JSONObject m=messages.getJSONObject(i);repo.put("messages",m.getString("id"),m,false);}
    if(!mode.equals("jwc")){
      repo.source("wechat-0","东南大学体育系","wechat");repo.source("wechat-3","东南大学吴健雄学院","wechat");repo.source("wechat-4","风雅颂东南","wechat");repo.source("wechat-5","至善青协","wechat");repo.source("wechat-7","东南大学集成电路学院","wechat");
    }
    if(!mode.equals("public"))repo.source("jwc","东南大学教务处","website");
    JSONObject one=run(repo,new NativeHttp());System.out.println("LIVE_FIRST "+one);int total=repo.list("messages").length();
    check(one.getInt("successful")>0&&one.getInt("failed")==0,"production Java HTTPS transport reads real sources");
    JSONObject two=run(repo,new NativeHttp());System.out.println("LIVE_REPEAT "+two);
    check(two.getInt("added")==0&&repo.list("messages").length()==total,"real source repeat creates no duplicates");
    System.out.println("LIVE_TOTAL "+total);
  }
}
