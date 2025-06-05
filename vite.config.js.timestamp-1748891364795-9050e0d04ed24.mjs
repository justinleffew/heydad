// vite.config.js
import { defineConfig } from "file:///C:/Users/jalle/Dropbox/Breadcrumb/HeyDad2/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/jalle/Dropbox/Breadcrumb/HeyDad2/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { WebSocketServer } from "file:///C:/Users/jalle/Dropbox/Breadcrumb/HeyDad2/node_modules/ws/wrapper.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      overlay: true,
      protocol: "ws",
      host: "localhost",
      port: 5173,
      clientPort: 5173
    },
    setup: (server) => {
      server.middlewares.use("/api/webhook", async (req, res) => {
        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              const stripe = new (await import("file:///C:/Users/jalle/Dropbox/Breadcrumb/HeyDad2/node_modules/stripe/esm/stripe.esm.node.js")).default(process.env.VITE_STRIPE_SECRET_KEY);
              const signature = req.headers["stripe-signature"];
              const event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.VITE_STRIPE_WEBHOOK_SECRET
              );
              switch (event.type) {
                case "checkout.session.completed": {
                  const session = event.data.object;
                  console.log("Checkout completed:", session);
                  break;
                }
                case "customer.subscription.updated": {
                  const subscription = event.data.object;
                  console.log("Subscription updated:", subscription);
                  break;
                }
                case "customer.subscription.deleted": {
                  const subscription = event.data.object;
                  console.log("Subscription deleted:", subscription);
                  break;
                }
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ received: true }));
            } catch (err) {
              console.error("Webhook error:", err.message);
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
      });
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxqYWxsZVxcXFxEcm9wYm94XFxcXEJyZWFkY3J1bWJcXFxcSGV5RGFkMlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcamFsbGVcXFxcRHJvcGJveFxcXFxCcmVhZGNydW1iXFxcXEhleURhZDJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2phbGxlL0Ryb3Bib3gvQnJlYWRjcnVtYi9IZXlEYWQyL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gJ2h0dHAnXG5pbXBvcnQgeyBXZWJTb2NrZXRTZXJ2ZXIgfSBmcm9tICd3cydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgYmFzZTogJy8nLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogNTE3MyxcbiAgICB3YXRjaDoge1xuICAgICAgdXNlUG9sbGluZzogdHJ1ZSxcbiAgICAgIGludGVydmFsOiAxMDBcbiAgICB9LFxuICAgIGhtcjoge1xuICAgICAgb3ZlcmxheTogdHJ1ZSxcbiAgICAgIHByb3RvY29sOiAnd3MnLFxuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICBwb3J0OiA1MTczLFxuICAgICAgY2xpZW50UG9ydDogNTE3M1xuICAgIH0sXG4gICAgc2V0dXA6IChzZXJ2ZXIpID0+IHtcbiAgICAgIC8vIEhhbmRsZSBTdHJpcGUgd2ViaG9va1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS93ZWJob29rJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICAgIHJlcS5vbignZGF0YScsIGNodW5rID0+IHtcbiAgICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN0cmlwZSA9IG5ldyAoYXdhaXQgaW1wb3J0KCdzdHJpcGUnKSkuZGVmYXVsdChwcm9jZXNzLmVudi5WSVRFX1NUUklQRV9TRUNSRVRfS0VZKTtcbiAgICAgICAgICAgICAgY29uc3Qgc2lnbmF0dXJlID0gcmVxLmhlYWRlcnNbJ3N0cmlwZS1zaWduYXR1cmUnXTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gc3RyaXBlLndlYmhvb2tzLmNvbnN0cnVjdEV2ZW50KFxuICAgICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgICAgc2lnbmF0dXJlLFxuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LlZJVEVfU1RSSVBFX1dFQkhPT0tfU0VDUkVUXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSBldmVudFxuICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZCc6IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHNlc3Npb24gPSBldmVudC5kYXRhLm9iamVjdDtcbiAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBzdWNjZXNzZnVsIGNoZWNrb3V0XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2hlY2tvdXQgY29tcGxldGVkOicsIHNlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2N1c3RvbWVyLnN1YnNjcmlwdGlvbi51cGRhdGVkJzoge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gZXZlbnQuZGF0YS5vYmplY3Q7XG4gICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgc3Vic2NyaXB0aW9uIHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N1YnNjcmlwdGlvbiB1cGRhdGVkOicsIHN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnY3VzdG9tZXIuc3Vic2NyaXB0aW9uLmRlbGV0ZWQnOiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBldmVudC5kYXRhLm9iamVjdDtcbiAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBzdWJzY3JpcHRpb24gZGVsZXRpb25cbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdWJzY3JpcHRpb24gZGVsZXRlZDonLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHJlY2VpdmVkOiB0cnVlIH0pKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdXZWJob29rIGVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDUsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59KSAiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlULFNBQVMsb0JBQW9CO0FBQ3RWLE9BQU8sV0FBVztBQUVsQixTQUFTLHVCQUF1QjtBQUdoQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLE1BQ1osVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxJQUNkO0FBQUEsSUFDQSxPQUFPLENBQUMsV0FBVztBQUVqQixhQUFPLFlBQVksSUFBSSxnQkFBZ0IsT0FBTyxLQUFLLFFBQVE7QUFDekQsWUFBSSxJQUFJLFdBQVcsUUFBUTtBQUN6QixjQUFJLE9BQU87QUFDWCxjQUFJLEdBQUcsUUFBUSxXQUFTO0FBQ3RCLG9CQUFRLE1BQU0sU0FBUztBQUFBLFVBQ3pCLENBQUM7QUFFRCxjQUFJLEdBQUcsT0FBTyxZQUFZO0FBQ3hCLGdCQUFJO0FBQ0Ysb0JBQU0sU0FBUyxLQUFLLE1BQU0sT0FBTyw4RkFBUSxHQUFHLFFBQVEsUUFBUSxJQUFJLHNCQUFzQjtBQUN0RixvQkFBTSxZQUFZLElBQUksUUFBUSxrQkFBa0I7QUFFaEQsb0JBQU0sUUFBUSxPQUFPLFNBQVM7QUFBQSxnQkFDNUI7QUFBQSxnQkFDQTtBQUFBLGdCQUNBLFFBQVEsSUFBSTtBQUFBLGNBQ2Q7QUFHQSxzQkFBUSxNQUFNLE1BQU07QUFBQSxnQkFDbEIsS0FBSyw4QkFBOEI7QUFDakMsd0JBQU0sVUFBVSxNQUFNLEtBQUs7QUFFM0IsMEJBQVEsSUFBSSx1QkFBdUIsT0FBTztBQUMxQztBQUFBLGdCQUNGO0FBQUEsZ0JBQ0EsS0FBSyxpQ0FBaUM7QUFDcEMsd0JBQU0sZUFBZSxNQUFNLEtBQUs7QUFFaEMsMEJBQVEsSUFBSSx5QkFBeUIsWUFBWTtBQUNqRDtBQUFBLGdCQUNGO0FBQUEsZ0JBQ0EsS0FBSyxpQ0FBaUM7QUFDcEMsd0JBQU0sZUFBZSxNQUFNLEtBQUs7QUFFaEMsMEJBQVEsSUFBSSx5QkFBeUIsWUFBWTtBQUNqRDtBQUFBLGdCQUNGO0FBQUEsY0FDRjtBQUVBLGtCQUFJLFVBQVUsS0FBSyxFQUFFLGdCQUFnQixtQkFBbUIsQ0FBQztBQUN6RCxrQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLFVBQVUsS0FBSyxDQUFDLENBQUM7QUFBQSxZQUM1QyxTQUFTLEtBQUs7QUFDWixzQkFBUSxNQUFNLGtCQUFrQixJQUFJLE9BQU87QUFDM0Msa0JBQUksVUFBVSxLQUFLLEVBQUUsZ0JBQWdCLG1CQUFtQixDQUFDO0FBQ3pELGtCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDO0FBQUEsWUFDaEQ7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNILE9BQU87QUFDTCxjQUFJLFVBQVUsS0FBSyxFQUFFLGdCQUFnQixtQkFBbUIsQ0FBQztBQUN6RCxjQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxxQkFBcUIsQ0FBQyxDQUFDO0FBQUEsUUFDekQ7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
