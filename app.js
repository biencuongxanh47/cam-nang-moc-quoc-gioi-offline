
document.addEventListener("DOMContentLoaded", function () {
  if (!("serviceWorker" in navigator)) return;

  let refreshing = false;
  let updateMessageShown = false;

  function showUpdateMessage() {
    if (updateMessageShown) return;
    updateMessageShown = true;

    const banner = document.createElement("div");
    banner.id = "update-notice";
    banner.setAttribute("role", "status");

    banner.style.cssText = [
      "position:fixed",
      "left:12px",
      "right:12px",
      "bottom:16px",
      "z-index:99999",
      "padding:16px",
      "background:#14532d",
      "color:#fff",
      "border-radius:12px",
      "box-shadow:0 4px 16px rgba(0,0,0,.25)",
      "font:16px/1.5 Arial,sans-serif"
    ].join(";");

    const message = document.createElement("div");
    message.textContent =
      "Cẩm nang đã có phiên bản mới. Vui lòng tải lại để cập nhật nội dung.";

    const button = document.createElement("button");
    button.textContent = "Cập nhật ngay";
    button.style.cssText =
      "margin-top:12px;padding:10px 16px;border:0;border-radius:8px;" +
      "background:#fff;color:#14532d;font-weight:bold;cursor:pointer";

    button.addEventListener("click", function () {
      window.location.reload();
    });

    banner.append(message, button);
    document.body.appendChild(banner);
  }

  navigator.serviceWorker.register("./service-worker.js")
    .then(function (registration) {
      // Kiểm tra phiên bản mới khi có mạng.
      function checkForUpdate() {
        if (navigator.onLine) {
          registration.update().catch(function () {});
        }
      }

      checkForUpdate();
      window.addEventListener("online", checkForUpdate);

      // Phát hiện Service Worker mới đang chờ kích hoạt.
      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdateMessage();
      }

      registration.addEventListener("updatefound", function () {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", function () {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdateMessage();
          }
        });
      });
    })
    .catch(function (error) {
      console.error("Không thể đăng ký Service Worker:", error);
    });

  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
});
