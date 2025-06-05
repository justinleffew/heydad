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
      server.middlewares.use("/api/create-checkout-session", async (req, res) => {
        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              const stripe = new (await import("file:///C:/Users/jalle/Dropbox/Breadcrumb/HeyDad2/node_modules/stripe/esm/stripe.esm.node.js")).default(process.env.VITE_STRIPE_SECRET_KEY);
              const { priceId, interval, isGuest, guestEmail } = JSON.parse(body);
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                  {
                    price: priceId,
                    quantity: 1
                  }
                ],
                mode: "subscription",
                success_url: `${process.env.VITE_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.VITE_APP_URL}/pricing`,
                customer_email: isGuest ? guestEmail : void 0,
                metadata: {
                  isGuest: isGuest ? "true" : "false",
                  interval
                }
              });
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ id: session.id }));
            } catch (err) {
              console.error("Error creating checkout session:", err.message);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
      });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxqYWxsZVxcXFxEcm9wYm94XFxcXEJyZWFkY3J1bWJcXFxcSGV5RGFkMlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcamFsbGVcXFxcRHJvcGJveFxcXFxCcmVhZGNydW1iXFxcXEhleURhZDJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2phbGxlL0Ryb3Bib3gvQnJlYWRjcnVtYi9IZXlEYWQyL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gJ2h0dHAnXG5pbXBvcnQgeyBXZWJTb2NrZXRTZXJ2ZXIgfSBmcm9tICd3cydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgYmFzZTogJy8nLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogNTE3MyxcbiAgICB3YXRjaDoge1xuICAgICAgdXNlUG9sbGluZzogdHJ1ZSxcbiAgICAgIGludGVydmFsOiAxMDBcbiAgICB9LFxuICAgIGhtcjoge1xuICAgICAgb3ZlcmxheTogdHJ1ZSxcbiAgICAgIHByb3RvY29sOiAnd3MnLFxuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICBwb3J0OiA1MTczLFxuICAgICAgY2xpZW50UG9ydDogNTE3M1xuICAgIH0sXG4gICAgc2V0dXA6IChzZXJ2ZXIpID0+IHtcbiAgICAgIC8vIEhhbmRsZSBTdHJpcGUgY2hlY2tvdXQgc2Vzc2lvbiBjcmVhdGlvblxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9jcmVhdGUtY2hlY2tvdXQtc2Vzc2lvbicsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBzdHJpcGUgPSBuZXcgKGF3YWl0IGltcG9ydCgnc3RyaXBlJykpLmRlZmF1bHQocHJvY2Vzcy5lbnYuVklURV9TVFJJUEVfU0VDUkVUX0tFWSk7XG4gICAgICAgICAgICAgIGNvbnN0IHsgcHJpY2VJZCwgaW50ZXJ2YWwsIGlzR3Vlc3QsIGd1ZXN0RW1haWwgfSA9IEpTT04ucGFyc2UoYm9keSk7XG5cbiAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgY2hlY2tvdXQgc2Vzc2lvblxuICAgICAgICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgc3RyaXBlLmNoZWNrb3V0LnNlc3Npb25zLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgcGF5bWVudF9tZXRob2RfdHlwZXM6IFsnY2FyZCddLFxuICAgICAgICAgICAgICAgIGxpbmVfaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IHByaWNlSWQsXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIG1vZGU6ICdzdWJzY3JpcHRpb24nLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NfdXJsOiBgJHtwcm9jZXNzLmVudi5WSVRFX0FQUF9VUkx9L3N1Y2Nlc3M/c2Vzc2lvbl9pZD17Q0hFQ0tPVVRfU0VTU0lPTl9JRH1gLFxuICAgICAgICAgICAgICAgIGNhbmNlbF91cmw6IGAke3Byb2Nlc3MuZW52LlZJVEVfQVBQX1VSTH0vcHJpY2luZ2AsXG4gICAgICAgICAgICAgICAgY3VzdG9tZXJfZW1haWw6IGlzR3Vlc3QgPyBndWVzdEVtYWlsIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICBpc0d1ZXN0OiBpc0d1ZXN0ID8gJ3RydWUnIDogJ2ZhbHNlJyxcbiAgICAgICAgICAgICAgICAgIGludGVydmFsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBpZDogc2Vzc2lvbi5pZCB9KSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgY2hlY2tvdXQgc2Vzc2lvbjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA1LCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBIYW5kbGUgU3RyaXBlIHdlYmhvb2tcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvd2ViaG9vaycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBzdHJpcGUgPSBuZXcgKGF3YWl0IGltcG9ydCgnc3RyaXBlJykpLmRlZmF1bHQocHJvY2Vzcy5lbnYuVklURV9TVFJJUEVfU0VDUkVUX0tFWSk7XG4gICAgICAgICAgICAgIGNvbnN0IHNpZ25hdHVyZSA9IHJlcS5oZWFkZXJzWydzdHJpcGUtc2lnbmF0dXJlJ107XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHN0cmlwZS53ZWJob29rcy5jb25zdHJ1Y3RFdmVudChcbiAgICAgICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgICAgIHNpZ25hdHVyZSxcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmVudi5WSVRFX1NUUklQRV9XRUJIT09LX1NFQ1JFVFxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIC8vIEhhbmRsZSB0aGUgZXZlbnRcbiAgICAgICAgICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2hlY2tvdXQuc2Vzc2lvbi5jb21wbGV0ZWQnOiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzZXNzaW9uID0gZXZlbnQuZGF0YS5vYmplY3Q7XG4gICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgc3VjY2Vzc2Z1bCBjaGVja291dFxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NoZWNrb3V0IGNvbXBsZXRlZDonLCBzZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdjdXN0b21lci5zdWJzY3JpcHRpb24udXBkYXRlZCc6IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGV2ZW50LmRhdGEub2JqZWN0O1xuICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHN1YnNjcmlwdGlvbiB1cGRhdGVcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTdWJzY3JpcHRpb24gdXBkYXRlZDonLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2N1c3RvbWVyLnN1YnNjcmlwdGlvbi5kZWxldGVkJzoge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gZXZlbnQuZGF0YS5vYmplY3Q7XG4gICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgc3Vic2NyaXB0aW9uIGRlbGV0aW9uXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3Vic2NyaXB0aW9uIGRlbGV0ZWQ6Jywgc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyByZWNlaXZlZDogdHJ1ZSB9KSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignV2ViaG9vayBlcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA1LCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSkgIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VCxTQUFTLG9CQUFvQjtBQUN0VixPQUFPLFdBQVc7QUFFbEIsU0FBUyx1QkFBdUI7QUFHaEMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsSUFD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
