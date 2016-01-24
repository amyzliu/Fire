package com.example.loganjoe1997.sparcs;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.StrictMode;
import android.os.StrictMode.ThreadPolicy;
import android.provider.MediaStore;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import android.util.Base64;

import org.apache.http.*;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HTTP;
import org.json.JSONObject;

import java.io.*;
import java.net.*;

import javax.net.ssl.HttpsURLConnection;


public class MainActivity extends AppCompatActivity {
    final String desURL = "http://159.203.10.210/test";
    URL url;
    HttpURLConnection connection;
    int maxBufferSize = 1*1024*1024;
    int bytesAvailable;
    int bufferSize;
    int bytesRead;
    //Button photoButton;
    //TextView welcome;


    public String getPath(Uri uri) {
        String imagePath;
        int column_index;
        String[] projection = { MediaStore.MediaColumns.DATA };
        Cursor cursor = managedQuery(uri, projection, null, null, null);
        column_index = cursor
                .getColumnIndexOrThrow(MediaStore.MediaColumns.DATA);
        cursor.moveToFirst();
        imagePath = cursor.getString(column_index);
        return imagePath;
    }

    public void uploadPhoto(View v){
        Intent photoPickerIntent = new Intent(Intent.ACTION_PICK);
        photoPickerIntent.setType("image/*");
        startActivityForResult(photoPickerIntent, 1);
        Toast.makeText(getApplicationContext(), "Found photo", Toast.LENGTH_LONG).show();
    }


    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        final String image;
        Bitmap bm;
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 1)
            if (resultCode == Activity.RESULT_OK) {
                Uri selectedImage = data.getData();

                String filePath = getPath(selectedImage);
                String file_extn = filePath.substring(filePath.lastIndexOf(".")+1);
                try {
                    if (file_extn.equals("img") || file_extn.equals("jpg") || file_extn.equals("jpeg") || file_extn.equals("gif") || file_extn.equals("png")) {
                        //photoButton.setText(filePath);
                        System.out.println("Worked");
                        File file = new File(filePath);

                        bm = BitmapFactory.decodeFile(filePath);
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        bm.compress(Bitmap.CompressFormat.JPEG,100,baos);
                        image = Base64.encodeToString(baos.toByteArray(), Base64.DEFAULT);
                        //sendPhoto(image);
                        //Toast.makeText(getApplicationContext(),"File sent", Toast.LENGTH_LONG).show();
                        new Thread(new Runnable(){
                            @Override
                            public void run(){

                                try {
                                    JSONObject data = new JSONObject();
                                    data.put("image", image);
                                    String newData = data.toString();
                                    HttpResponse response;
                                    /*System.out.println("In background");
                                    URLConnection connection = new URL(desURL).openConnection();
                                    HttpURLConnection params2 = (HttpURLConnection) new URL(desURL).openConnection();
                                    System.out.println("Code " + params2.getResponseCode());
                                    params2.setConnectTimeout(10000);
                                    params2.setRequestMethod("POST");
                                    params2.setRequestProperty("Content-Type", "application/json;charset=utf-8");
                                    params2.setRequestProperty("X-Requested-With","XMLHttpRequest");
                                    //params2.setRequestProperty("Authorization","application/json");
                                    params2.setDoOutput(true);
                                    connection.connect();*/
                                    HttpParams httpParams = new BasicHttpParams();
                                    HttpConnectionParams.setConnectionTimeout(httpParams,5000);
                                    HttpClient client = new DefaultHttpClient(httpParams);
                                    HttpPost request = new HttpPost(desURL);
                                    StringEntity se = new StringEntity(data.toString());
                                    se.setContentType(new BasicHeader(HTTP.CONTENT_TYPE, "application/json"));
                                    request.setEntity(se);
                                    response = client.execute(request);
                                    //OutputStream output = new BufferedOutputStream(connection.getOutputStream());
                                   //output.write(newData.getBytes());
                                    //output.flush();
                                    //BufferedWriter write = new BufferedWriter(new OutputStreamWriter(output,"UTF-8"));
                                   //System.out.println(params2.getResponseMessage());
                                   //write.write(newData);
                                    //System.out.println(params2.getResponseMessage().toString());
                                    //write.flush();
                                    //System.out.println(params2.getResponseMessage().toString());
                                    //write.close();
                                    //output.close();
                                    //Toast.makeText(getApplicationContext(),"Finished send", Toast.LENGTH_LONG).show();
                                }
                                catch (Exception e){
                                    System.out.println("Weird networking error");
                                    System.err.println(e);
                                }
                            }
                        }).run();

                    }
                    else{
                    }
                } catch (Exception e) {
                    // TODO Auto-generated catch block
                    System.out.println("Networking here, Pre-ImageSend");
                    e.printStackTrace();
                }
            }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Bundle extras = getIntent().getExtras();
        String value = (extras == null) ? "" : extras.getString("name");
        //welcome = (TextView) findViewById(R.id.welcomeBox);
        //welcome.setText("Welcome back!");

        ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        /*photoButton.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view){
                Intent photoPickerIntent = new Intent(Intent.ACTION_PICK);
                photoPickerIntent.setType("image/*");
                startActivityForResult(photoPickerIntent,1);
            }*/
        ;
    }
       // FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        /*public void sendPhoto(String image){
        try {

            byte[] buffer;
            connection = (HttpURLConnection) url.openConnection();
            url = new URL(desURL);
            connection.setRequestMethod("POST");
            connection.setUseCaches(false);
            connection.setDoInput(true);
            connection.setDoOutput(true);
            DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
            FileInputStream fileStream = new FileInputStream(file);
            bytesAvailable = fileStream.available();
            bufferSize = Math.min(bytesAvailable, maxBufferSize);
            buffer = new byte[bufferSize];
            bytesRead = fileStream.read(buffer, 0, bufferSize);
            while (bytesRead > 0) {
                wr.write(buffer, 0, bufferSize);
                bytesAvailable = fileStream.available();
                bufferSize = Math.min(maxBufferSize, bytesAvailable);
                bytesRead = fileStream.read(buffer, 0, bufferSize);
            }
            wr.writeBytes("\r\n");
            fileStream.close();
            wr.flush();
            wr.close();
        } catch (Exception e) {
            System.err.println(e);
        }
    }
*/
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
