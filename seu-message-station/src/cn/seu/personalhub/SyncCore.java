package cn.seu.personalhub;

import org.json.*;
import org.jsoup.Jsoup;
import org.jsoup.nodes.*;
import org.jsoup.safety.Safelist;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.*;

/** The same sync implementation is used by foreground refresh and Android JobScheduler. */
public final class SyncCore {
  public interface Repository {
    JSONArray list(String kind) throws Exception;
    void put(String kind,String id,JSONObject value,boolean merge) throws Exception;
    String secret(String name);
  }
  public interface Transport { String get(String url,Map<String,String> headers) throws Exception; }
  public interface Observer { void source(String id,boolean running); default void message(){} }
  private final Repository repo;private final Transport net;private final Observer observer;
  private final Map<String,JSONObject> messages=new HashMap<>();
  private final JSONArray results=new JSONArray();
  private final String start=Instant.now().toString();
  private int added,updated,unchanged,successful,failed;
  private static final Map<String,String> PUBLIC=new LinkedHashMap<>();
  static {PUBLIC.put("wechat-0","mp-a12");PUBLIC.put("wechat-3","mp-c29");PUBLIC.put("wechat-4","mp-b05");PUBLIC.put("wechat-5","mp-zhishan-volunteers");PUBLIC.put("wechat-7","mp-seu-ic");}
  public SyncCore(Repository repository,Transport transport,Observer changes){repo=repository;net=transport;observer=changes;}
  public static JSONObject object(Object... pairs)throws Exception{JSONObject out=new JSONObject();for(int i=0;i<pairs.length;i+=2)out.put((String)pairs[i],pairs[i+1]);return out;}
  private static String time(){return Instant.now().toString();}
  private static void check(){if(Thread.currentThread().isInterrupted())throw new CancellationException("更新被系统中断，稍后重试");}
  private String get(String url,Map<String,String> headers)throws Exception{check();return net.get(url,headers);}
  private String get(String url)throws Exception{return get(url,Collections.emptyMap());}
  private JSONObject source(String id)throws Exception{JSONArray all=repo.list("sources");for(int i=0;i<all.length();i++){JSONObject s=all.getJSONObject(i);if(id.equals(s.optString("id")))return s;}return null;}
  private void startSource(JSONObject s)throws Exception{s=source(s.getString("id"));s.put("status","syncing").put("last_attempt",time()).put("error","");repo.put("sources",s.getString("id"),s,false);observer.source(s.getString("id"),true);}
  private synchronized void finishSource(JSONObject s,Count count,String error)throws Exception{
    JSONObject current=source(s.getString("id"));current.put("status",error.isEmpty()?"ready":"error").put("error",error).put("last_checked",time()).put("last_added",count.added).put("last_updated",count.updated);
    if(error.isEmpty()){current.put("last_success",time());successful++;}else failed++;
    if(PUBLIC.containsKey(s.getString("id")))current.put("note","公开聚合来源，部分内容仅提供摘要；完整内容请看原文");
    repo.put("sources",current.getString("id"),current,false);added+=count.added;updated+=count.updated;unchanged+=count.unchanged;
    results.put(object("id",s.getString("id"),"name",s.getString("name"),"added",count.added,"updated",count.updated,"unchanged",count.unchanged,"error",error));observer.source(s.getString("id"),false);
  }
  private static class Count{int added,updated,unchanged;void include(int result){if(result==1)added++;else if(result==2)updated++;else unchanged++;}}
  public JSONObject run(String sourceFilter,String trigger)throws Exception{
    JSONArray original=repo.list("messages");for(int i=0;i<original.length();i++){JSONObject m=original.getJSONObject(i);messages.put(m.getString("source_id")+"|"+m.getString("external_id"),m);}
    List<JSONObject> publicSources=new ArrayList<>(),otherSources=new ArrayList<>();JSONArray sources=repo.list("sources");
    for(int i=0;i<sources.length();i++){JSONObject s=sources.getJSONObject(i);if(s.optString("type").equals("manual"))continue;
      if(!sourceFilter.isEmpty()&&!sourceFilter.equals(s.optString("id")))continue;if(sourceFilter.isEmpty()&&s.optInt("enabled",1)==0)continue;
      if(PUBLIC.containsKey(s.optString("id"))){s.put("public_id",PUBLIC.get(s.getString("id")));publicSources.add(s);}
      else if(s.optString("type").equals("website")||!sourceFilter.isEmpty()||(!s.optString("book_id").isEmpty()&&!repo.secret("weread").isEmpty()))otherSources.add(s);
    }
    ExecutorService pool=Executors.newFixedThreadPool(2);List<Future<?>> tasks=new ArrayList<>();
    try{
      if(!publicSources.isEmpty())tasks.add(pool.submit(()->{try{publicFeeds(publicSources);}catch(Exception error){throw new CompletionException(error);}}));
      for(JSONObject s:otherSources)tasks.add(pool.submit(()->{try{oneSource(s);}catch(Exception error){throw new CompletionException(error);}}));
      for(Future<?> task:tasks)task.get();
    }finally{pool.shutdownNow();}
    return object("started_at",start,"finished_at",time(),"trigger",trigger,"added",added,"updated",updated,"unchanged",unchanged,"successful",successful,"failed",failed,"results",results,"status",failed==0?"success":successful>0?"partial":"error");
  }
  private void publicFeeds(List<JSONObject> sources)throws Exception{
    Map<String,Count> counts=new HashMap<>();for(JSONObject s:sources){counts.put(s.getString("id"),new Count());startSource(s);}
    String failure="";try{
      StringJoiner ids=new StringJoiner(",");for(JSONObject s:sources)ids.add(s.getString("public_id"));
      for(int page=1;page<=4;page++){
        JSONObject payload=new JSONObject(get("https://seu.wiki/api/site/pool?sources="+URLEncoder.encode(ids.toString(),"UTF-8")+"&page="+page));
        JSONArray items=payload.optJSONArray("items");if(items==null)throw new Exception("公开订阅返回了验证页或无效内容");
        for(int i=0;i<items.length();i++){
          JSONObject item=items.getJSONObject(i),upstream=item.optJSONObject("source");if(upstream==null)continue;
          String sourceName=upstream.optString("name").replaceFirst("^公众号[·・]","");JSONObject s=null;
          for(JSONObject candidate:sources)if(candidate.getString("name").replaceAll("\\s","").equals(sourceName.replaceAll("\\s",""))){s=candidate;break;}
          if(s==null)continue;String id=item.getString("id"),summary=item.optString("summary"),title=item.getString("title");
          JSONObject message=object("source_id",s.getString("id"),"external_id","public:"+id,"public_item_id",id,"title",title,"summary",summary,"text",summary,"html","","url","https://seu.wiki/items/"+id,"published_at",item.opt("publishedAt"),"category",category(title,summary+item.optJSONArray("tags")),"via","SEU Wiki 公开聚合","body_scope","summary","attachments",new JSONArray(),"extracted",new JSONObject());
          counts.get(s.getString("id")).include(upsert(message));
        }
        if(page>=payload.optInt("pageCount",1))break;
      }
    }catch(Exception error){failure=explain(error);}
    for(JSONObject s:sources)finishSource(s,counts.get(s.getString("id")),failure);
  }
  private void oneSource(JSONObject s)throws Exception{startSource(s);Count count=new Count();String failure="";try{if(s.optString("type").equals("website"))website(s,count);else weread(s,count);}catch(Exception error){failure=explain(error);}finishSource(s,count,failure);}
  private void website(JSONObject s,Count count)throws Exception{
    String url=s.getString("url");Set<String> visited=new HashSet<>();LocalDate cutoff=LocalDate.now(ZoneOffset.ofHours(8)).minusDays(30);
    for(int page=0;page<8&&!url.isEmpty()&&visited.add(url);page++){
      Document document=Jsoup.parse(get(url),url);Set<String> seen=new HashSet<>();boolean old=false,known=false;int found=0;
      List<JSONObject> details=new ArrayList<>();
      for(Element anchor:document.select("a[href]")){
        String link=resolve(url,anchor.attr("href")),title=anchor.hasAttr("title")?anchor.attr("title").trim():anchor.text().trim();
        if(title.isEmpty()||!seen.add(link)||!(link.matches(".*/20[0-9]{2}/[0-9]{4}/.*/page\\.(htm|psp).*" )||link.startsWith("https://mp.weixin.qq.com/s")))continue;
        found++;Element row=anchor.closest("li,.news-list-item,.news_list_item,.list_item");if(row==null)row=anchor.parent();LocalDate published=publishedDate(row.text());
        if(published!=null&&published.isBefore(cutoff)){old=true;continue;}
        String external=link.split("#",2)[0];JSONObject existing=lookup(s.getString("id"),external,link);
        if(existing!=null){known=true;if(existing.optString("title").equals(title)&&(!existing.optString("text").isEmpty()||!existing.optString("html").isEmpty())){count.unchanged++;continue;}}
        JSONObject message=object("source_id",s.getString("id"),"external_id",external,"title",title,"url",link,"published_at",published==null?JSONObject.NULL:published.toString());
        if(existing==null){count.include(upsert(new JSONObject(message.toString()).put("category",category(title,""))));}
        details.add(message.put("new_record",existing==null));
      }
      if(found==0)throw new Exception("教务处列表未识别到通知，可能需要网络验证");
      for(JSONObject item:details){
        check();String link=item.getString("url");boolean newRecord=item.getBoolean("new_record");item.remove("new_record");
        try{
          JSONObject article=parseArticle(get(link),link);
          if(article.optString("html").isEmpty()&&article.optString("text").isEmpty())throw new Exception("原网页未返回可读取的正文");
          for(String key:keys(article))item.put(key,article.get(key));
          item.put("fetch_error","").put("category",category(item.getString("title"),article.optString("text")));
        }catch(CancellationException|InterruptedException error){throw error;}
        catch(Exception error){
          JSONObject local=lookup(item.getString("source_id"),item.getString("external_id"),link);
          if(local!=null&&(!local.optString("html").isEmpty()||!local.optString("text").isEmpty())){count.unchanged++;continue;}
          item.put("fetch_error",explain(error));
        }
        int result=upsert(item);if(!newRecord)count.include(result);
      }
      if(old||known)break;
      Element next=null;for(Element a:document.select("a[href]"))if(a.text().contains("下一页")){next=a;break;}url=next==null?"":resolve(url,next.attr("href"));
    }
  }
  private static final Pattern LIST_DATE=Pattern.compile("(20[0-9]{2})[-/.]([0-9]{1,2})[-/.]([0-9]{1,2})");
  private static LocalDate publishedDate(String text){
    Matcher date=LIST_DATE.matcher(text);if(date.find())try{return LocalDate.of(Integer.parseInt(date.group(1)),Integer.parseInt(date.group(2)),Integer.parseInt(date.group(3)));}catch(DateTimeException ignored){}
    return null;
  }
  private void weread(JSONObject s,Count count)throws Exception{
    JSONObject jar;try{jar=new JSONObject(repo.secret("weread"));}catch(Exception e){throw new Exception("尚未连接微信读书；可在来源页补充连接");}
    if(jar.optString("wr_vid").isEmpty())throw new Exception("尚未连接微信读书");String book=s.optString("book_id");if(!book.matches("MP_WXS_[0-9]+"))throw new Exception("尚未识别该公众号账号，请匹配书架或导入文章");
    Map<String,String> headers=new LinkedHashMap<>();StringJoiner cookie=new StringJoiner("; ");Iterator<String> keys=jar.keys();while(keys.hasNext()){String k=keys.next();cookie.add(k+"="+jar.getString(k));}headers.put("Cookie",cookie.toString());headers.put("Origin","https://weread.qq.com");headers.put("Referer","https://weread.qq.com/");
    JSONObject cover=new JSONObject(get("https://weread.qq.com/api/mp/cover?bookId="+book,headers));if(cover.optInt("errCode")!=0)throw new Exception("微信读书登录过期或暂时限制访问，请重新连接");String review=cover.optString("reviewId");if(review.isEmpty())throw new Exception("微信读书未收录该公众号的最新文章");
    String token=review.startsWith(book+"_")?review.substring(book.length()+1):review;String url="https://mp.weixin.qq.com/s/"+token.replace('~','_');
    if(lookup(s.getString("id"),review,url)!=null){count.unchanged++;return;}
    JSONObject message;try{message=parseArticle(get("https://weread.qq.com/web/mp/content?reviewId="+URLEncoder.encode(review,"UTF-8"),headers),url);}catch(Exception e){message=object("html","","text","","attachments",new JSONArray());}
    message.put("source_id",s.getString("id")).put("external_id",review).put("title",cover.optString("title","公众号最新文章")).put("url",url).put("published_at",JSONObject.NULL).put("category",category(cover.optString("title"),message.optString("text")));count.include(upsert(message));
  }
  private synchronized JSONObject lookup(String source,String external,String url){JSONObject hit=messages.get(source+"|"+external);if(hit!=null)return hit;for(JSONObject m:messages.values())if(source.equals(m.optString("source_id"))&&!url.isEmpty()&&url.equals(m.optString("url")))return m;return null;}
  private synchronized int upsert(JSONObject input)throws Exception{
    String source=input.getString("source_id"),external=input.getString("external_id");JSONObject old=lookup(source,external,input.optString("url"));boolean changed=old==null;
    if(old!=null){for(String key:keys(input)){if(Arrays.asList("url","html","text","attachments","extracted","body_scope").contains(key)&&input.has("public_item_id"))continue;if(!Objects.equals(String.valueOf(old.opt(key)),String.valueOf(input.opt(key)))){changed=true;break;}}}
    if(!changed)return 0;
    JSONObject out=old==null?object("id",UUID.randomUUID().toString(),"created_at",time(),"read",0,"starred",0,"summary","","extracted",new JSONObject(),"attachments",new JSONArray()):new JSONObject(old.toString());
    for(String key:keys(input)){
      if(old!=null&&input.has("public_item_id")&&Arrays.asList("url","html","text","body_scope","attachments","extracted").contains(key)&&old.optBoolean("public_loaded"))continue;
      out.put(key,input.get(key));
    }
    if(old!=null&&input.has("public_item_id")&&changed)out.put("public_loaded",false);
    out.put("updated_at",time());
    repo.put("messages",out.getString("id"),out,true);messages.put(source+"|"+external,out);observer.message();return old==null?1:2;
  }
  public static JSONObject parseArticle(String html,String url)throws Exception{
    Document doc=Jsoup.parse(html,url);Element body=doc.selectFirst("#js_content,.rich_media_content,.wp_articlecontent,article,.v_news_content,.article-content");JSONArray attachments=new JSONArray();String text="",safeHtml="";
    if(body!=null){for(Element image:body.select("img")){String src=image.hasAttr("data-src")?image.attr("data-src"):image.attr("src");image.attr("src",resolve(url,src));}for(Element a:body.select("a[href]")){String href=resolve(url,a.attr("href"));if(href.matches(".*\\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z)(\\?.*)?$")||a.text().contains("附件")||a.text().contains("下载"))attachments.put(object("name",a.text().isEmpty()?"附件":a.text(),"url",href));}text=body.wholeText().trim();Safelist allowed=Safelist.relaxed().addTags("h1","h2","h3","h4","hr").addAttributes("img","loading","referrerpolicy");safeHtml=Jsoup.clean(body.html(),url,allowed,new Document.OutputSettings().prettyPrint(false));}
    return object("html",safeHtml,"text",text,"attachments",attachments);
  }
  public static String resolve(String base,String link){try{if(link.isEmpty())return "";URI u=new URI(base).resolve(link);return "https".equals(u.getScheme())||"http".equals(u.getScheme())?u.toString():"";}catch(Exception e){return "";}}
  private static List<String> keys(JSONObject value){List<String> out=new ArrayList<>();Iterator<String> iterator=value.keys();while(iterator.hasNext())out.add(iterator.next());return out;}
  public static String category(String title,String body){String t=title+" "+body.substring(0,Math.min(450,body.length()));if(t.matches("(?s).*(志愿|青协|公益|支教|献血).*"))return "志愿服务";if(t.matches("(?s).*(奖学金|助学|资助|瑞华|补助).*"))return "奖助学金";if(t.matches("(?is).*(竞赛|比赛|科研|SRTP|蓝桥|实验室|建模|科创).*"))return "竞赛科研";if(t.matches("(?s).*(体育|运动|体测|跑操|校园跑|音乐|演出|艺术|文艺|合唱|风雅颂|球赛).*"))return "文体活动";if(t.matches("(?s).*(考试|教务|学籍|选课|课程|四六级|毕业|学分|补考).*"))return "教务考试";return "其他";}
  public static String explain(Exception error){Throwable e=error;while((e instanceof ExecutionException||e instanceof CompletionException)&&e.getCause()!=null)e=e.getCause();if(e instanceof java.net.UnknownHostException)return "无法解析来源域名，请检查网络或切换 Wi-Fi／流量后重试";if(e instanceof java.net.SocketTimeoutException)return "来源连接超时，请稍后重试";if(e instanceof javax.net.ssl.SSLException)return "来源安全连接失败，请检查手机日期、网络验证和系统证书";if(e instanceof CancellationException||e instanceof InterruptedException)return "本次更新被中断，打开应用后会再次检查";String message=e.getMessage();return message==null||message.isEmpty()?"更新失败（"+e.getClass().getSimpleName()+"）":message.substring(0,Math.min(220,message.length()));}
}
