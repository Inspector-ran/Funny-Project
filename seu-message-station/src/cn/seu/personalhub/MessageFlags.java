package cn.seu.personalhub;
import org.json.*;

/** Changes flags against the latest database payload without replacing article content. */
public final class MessageFlags {
  private static final String[] LOCAL={"read","starred","pinned_at","deleted_at"};
  private MessageFlags(){}
  public static JSONObject apply(JSONObject latest,JSONObject patch,JSONObject expected)throws JSONException{
    JSONObject result=new JSONObject(latest.toString());
    for(String key:LOCAL){
      if(!patch.has(key))continue;
      long value=patch.getLong(key);
      long max=key.endsWith("_at")?9007199254740991L:1;
      if(value<0||value>max)throw new IllegalArgumentException("Invalid message flag");
      if(expected!=null&&expected.has(key)&&latest.optLong(key)!=expected.getLong(key))continue;
      result.put(key,value);
    }
    return result;
  }
  public static JSONObject keepLocal(JSONObject latest,JSONObject incoming)throws JSONException{
    for(String key:LOCAL)incoming.put(key,latest.optLong(key));
    return incoming;
  }
}
