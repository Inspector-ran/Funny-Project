package cn.poetrycalendar.daily;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class MainActivity extends Activity {
  private static final String ORIGIN="https://appassets.androidplatform.net";
  private static final String HOME=ORIGIN+"/index.html";
  private static final Map<String,String> ASSETS=new HashMap<>();
  static {
    ASSETS.put("/index.html","text/html");
    ASSETS.put("/style.css","text/css");
    ASSETS.put("/app.js","text/javascript");
    ASSETS.put("/poems.js","text/javascript");
    ASSETS.put("/schedule.js","text/javascript");
    ASSETS.put("/poems-license.txt","text/plain");
  }
  private WebView web;

  @Override public void onCreate(Bundle saved){
    super.onCreate(saved);
    FrameLayout frame=new FrameLayout(this);
    frame.setBackgroundColor(Color.rgb(246,240,227));
    frame.setOnApplyWindowInsetsListener((view,insets)->{
      if(Build.VERSION.SDK_INT>=30){
        android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());
        view.setPadding(bars.left,bars.top,bars.right,bars.bottom);
        return WindowInsets.CONSUMED;
      }
      view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),
        insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
      return insets.consumeSystemWindowInsets();
    });
    web=new WebView(this);
    web.setBackgroundColor(Color.rgb(246,240,227));
    WebSettings settings=web.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(false);
    settings.setBlockNetworkLoads(true);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    web.setWebViewClient(new WebViewClient(){
      @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
        Uri url=request.getUrl();
        String path=url.getPath(),mime=ASSETS.get(path);
        if(local(url)&&mime!=null&&"GET".equals(request.getMethod())){
          try{
            return new WebResourceResponse(mime,"UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-store"),
              getAssets().open("public"+path));
          }catch(IOException ignored){}
        }
        return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",Collections.emptyMap(),
          new ByteArrayInputStream(new byte[0]));
      }
      @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
        Uri url=request.getUrl();
        if(local(url)&&("/index.html".equals(url.getPath())||"/poems-license.txt".equals(url.getPath())))return false;
        if(request.isForMainFrame()&&request.hasGesture()&&"https".equals(url.getScheme())&&!local(url)){
          try{startActivity(new Intent(Intent.ACTION_VIEW,url));}
          catch(android.content.ActivityNotFoundException ignored){Toast.makeText(MainActivity.this,"未找到浏览器",Toast.LENGTH_SHORT).show();}
        }
        return true;
      }
    });
    frame.addView(web,new FrameLayout.LayoutParams(-1,-1));
    setContentView(frame);
    frame.requestApplyInsets();
    if(Build.VERSION.SDK_INT>=33)getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
      android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,this::handleBack);
    web.loadUrl(HOME);
  }

  private static boolean local(Uri url){
    return "https".equals(url.getScheme())&&"appassets.androidplatform.net".equals(url.getHost())&&url.getPort()==-1;
  }

  @Override protected void onResume(){
    super.onResume();
    if(web!=null)web.evaluateJavascript("window.dispatchEvent(new Event('poetry-resumed'))",null);
  }

  private void handleBack(){
    if(web!=null)web.evaluateJavascript("typeof window.poetryBack==='function'&&window.poetryBack()",result->{
      if(!"true".equals(result)){
        if(web!=null&&web.canGoBack())web.goBack();
        else finish();
      }
    });
  }

  @Override public void onBackPressed(){handleBack();}

  @Override protected void onDestroy(){
    if(web!=null){
      ((FrameLayout)web.getParent()).removeView(web);
      web.destroy();
      web=null;
    }
    super.onDestroy();
  }
}
