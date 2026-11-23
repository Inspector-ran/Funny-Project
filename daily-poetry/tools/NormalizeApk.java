import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;

public final class NormalizeApk {
  public static void main(String[] args)throws IOException {
    Set<String> names=new HashSet<>();
    try(ZipInputStream input=new ZipInputStream(Files.newInputStream(Paths.get(args[0])));
        ZipOutputStream output=new ZipOutputStream(Files.newOutputStream(Paths.get(args[1])))){
      ZipEntry original;
      while((original=input.getNextEntry())!=null){
        String name=original.getName().replace('\\','/');
        if(!names.add(name))throw new IOException("Duplicate APK entry: "+name);
        ZipEntry normalized=new ZipEntry(name);
        normalized.setMethod(original.getMethod());
        if(original.getTime()>=0)normalized.setTime(original.getTime());
        if(original.getMethod()==ZipEntry.STORED){
          normalized.setSize(original.getSize());
          normalized.setCompressedSize(original.getCompressedSize());
          normalized.setCrc(original.getCrc());
        }
        output.putNextEntry(normalized);
        input.transferTo(output);
        output.closeEntry();
        input.closeEntry();
      }
    }
  }
}
