package cn.seu.personalhub;
import org.json.*;

public final class MessageFlagsTest {
  static void check(boolean value,String label){if(!value)throw new AssertionError(label);System.out.println("PASS "+label);}
  public static void main(String[] args)throws Exception{
    JSONObject latest=new JSONObject("{\"id\":\"a\",\"read\":0,\"starred\":1,\"html\":\"new sync body\",\"summary\":\"saved AI summary\"}");
    JSONObject read=MessageFlags.apply(latest,new JSONObject("{\"read\":1}"),null);
    check(read.getInt("read")==1&&read.getInt("starred")==1&&read.getString("html").equals("new sync body")&&read.getString("summary").equals("saved AI summary"),"flag update preserves latest sync content and other flags");
    check(latest.getInt("read")==0,"input snapshot is not modified");
    JSONObject undo=MessageFlags.apply(read,new JSONObject("{\"read\":0}"),new JSONObject("{\"read\":1}"));
    check(undo.getInt("read")==0&&undo.getInt("starred")==1,"undo restores only the flag it changed");
    JSONObject changed=new JSONObject("{\"read\":0,\"starred\":0}");
    JSONObject skipped=MessageFlags.apply(changed,new JSONObject("{\"read\":0}"),new JSONObject("{\"read\":1}"));
    check(skipped.getInt("read")==0&&skipped.getInt("starred")==0,"undo does not override a later flag change");
    long timestamp=1760000000000L;
    JSONObject organized=MessageFlags.apply(latest,new JSONObject().put("pinned_at",timestamp).put("deleted_at",timestamp+1),null);
    JSONObject incoming=new JSONObject().put("html","new body from later refresh").put("read",1).put("pinned_at",0);
    JSONObject merged=MessageFlags.keepLocal(organized,incoming);
    check(merged.getLong("pinned_at")==timestamp&&merged.getLong("deleted_at")==timestamp+1&&merged.getInt("read")==0&&merged.getString("html").contains("later refresh"),"refresh keeps local pin and trash while replacing the article body");
    JSONObject restored=MessageFlags.apply(merged,new JSONObject().put("deleted_at",0),new JSONObject().put("deleted_at",timestamp+1));
    check(restored.getLong("deleted_at")==0&&restored.getLong("pinned_at")==timestamp,"restoring a trashed record retains its pin");
    JSONObject noStaleUndo=MessageFlags.apply(merged,new JSONObject().put("deleted_at",0),new JSONObject().put("deleted_at",timestamp));
    check(noStaleUndo.getLong("deleted_at")==timestamp+1,"stale undo cannot restore a message deleted again later");
    try{MessageFlags.apply(latest,new JSONObject("{\"read\":7}"),null);throw new AssertionError("invalid flag accepted");}catch(IllegalArgumentException expected){System.out.println("PASS invalid flag rejected");}
  }
}
