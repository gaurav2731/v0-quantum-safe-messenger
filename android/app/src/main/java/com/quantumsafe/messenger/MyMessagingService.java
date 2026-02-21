package com.quantumsafe.messenger;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyMessagingService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // App closed/background hone par ye trigger hoga
        showNotification("Quantum Message", "New secure message received.");
    }

    private void showNotification(String title, String body) {
        String channelId = "q_chat";
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(new NotificationChannel(channelId, "Quantum", NotificationManager.IMPORTANCE_HIGH));
        }
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setContentTitle(title).setContentText(body)
                .setSmallIcon(android.R.drawable.ic_lock_idle_lock).setAutoCancel(true);
        nm.notify(1, builder.build());
    }
}
