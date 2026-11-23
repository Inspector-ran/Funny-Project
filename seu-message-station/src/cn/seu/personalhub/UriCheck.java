package cn.seu.personalhub;
import android.content.*;
import android.net.Uri;
final class UriCheck{static void open(Context c,String raw){Uri u=Uri.parse(raw);if(!"https".equals(u.getScheme())&&!"http".equals(u.getScheme()))return;c.startActivity(new Intent(Intent.ACTION_VIEW,u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));}}
