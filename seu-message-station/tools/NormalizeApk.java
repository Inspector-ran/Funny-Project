import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;

/** ZIP members must use forward slashes for Android AssetManager on every build host. */
public final class NormalizeApk {
  public static void main(String[] args) throws Exception {
    if(args.length!=2)throw new IllegalArgumentException("input.apk output.apk");
    Set<String> names=new HashSet<>();
    try(ZipInputStream input=new ZipInputStream(Files.newInputStream(Paths.get(args[0])));
        ZipOutputStream output=new ZipOutputStream(Files.newOutputStream(Paths.get(args[1])))){
      ZipEntry entry;
      while((entry=input.getNextEntry())!=null){
        String name=entry.getName().replace('\\','/');
        if(!names.add(name))throw new IOException("Duplicate APK entry: "+name);
        ByteArrayOutputStream buffer=new ByteArrayOutputStream();
        byte[] bytes=new byte[8192];int count;
        while((count=input.read(bytes))!=-1)buffer.write(bytes,0,count);
        byte[] content=buffer.toByteArray();ZipEntry normalized=new ZipEntry(name);
        normalized.setMethod(entry.getMethod());
        if(entry.getTime()>=0)normalized.setTime(entry.getTime());
        if(entry.getMethod()==ZipEntry.STORED){CRC32 crc=new CRC32();crc.update(content);normalized.setSize(content.length);normalized.setCompressedSize(content.length);normalized.setCrc(crc.getValue());}
        output.putNextEntry(normalized);output.write(content);output.closeEntry();input.closeEntry();
      }
    }
    String[] required={"assets/public/index.html","assets/public/app.js","assets/public/native-backend.js","assets/public/style.css","assets/public/seed.json","assets/public/worker.html","assets/public/worker.js","assets/public/icon.svg","classes.dex","resources.arsc"};
    try(ZipFile apk=new ZipFile(args[1])){
      for(String name:required)if(apk.getEntry(name)==null)throw new IOException("Required Android asset missing: "+name);
      if(apk.getEntry("resources.arsc").getMethod()!=ZipEntry.STORED)throw new IOException("resources.arsc must remain uncompressed");
    }
    System.out.println("APK archive paths and all 8 app assets verified");
  }
}
