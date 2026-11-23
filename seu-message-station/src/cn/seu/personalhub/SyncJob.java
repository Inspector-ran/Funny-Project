package cn.seu.personalhub;
import android.app.job.*;
public class SyncJob extends JobService{
  private JobParameters current;
  @Override public boolean onStartJob(JobParameters params){current=params;SyncManager.start(this,"","system",report->{if(current!=params)return;current=null;jobFinished(params,report.optString("status").equals("error"));});return true;}
  @Override public boolean onStopJob(JobParameters params){current=null;SyncManager.cancelSystem();return true;}
}
