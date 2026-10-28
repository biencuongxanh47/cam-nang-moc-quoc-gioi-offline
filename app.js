
document.addEventListener("DOMContentLoaded", function () {
  if (!("serviceWorker" in navigator)) return;

  let updateNoticeShown = false;
  let waitingWorker = null;

  function showUpdateNotice(worker) {
    if (updateNoticeShown) return;

    updateNoticeShown = true;
    waitingWorker = worker;

    const banner = document.createElement("div");
    banner.id = "update-notice";
    banner.setAttribute("role", "status");

    banner.style.cssText =
      "position:fixed;left:12px;right:12px;bottom:20px;" +
      "z-index:999999;padding:16px;background:#14532d;color:#fff;" +
      "border-radius:12px;box-shadow:0 4px 18px rgba(0,0,0,.3);" +
      "font:16px/1.5 Arial,sans-serif";

    const message = document.createElement("div");
    message.textContent =
      "Cẩm nang đã có phiên bản mới. Nhấn nút bên dưới để cập nhật.";

    const button = document.createElement("button");
    button.textContent = "Cập nhật ngay";
    button.style.cssText =
      "margin-top:12px;padding:11px 18px;border:0;border-radius:8px;" +
      "background:#fff;color:#14532d;font-weight:bold;font-size:16px";

    button.addEventListener("click", function () {
      button.disabled = true;
      button.textContent = "Đang cập nhật...";

      sessionStorage.setItem("cam-nang-update-approved", "yes");

      if (waitingWorker) {
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
      } else {
        window.location.reload();
      }
    });

    banner.appendChild(message);
    banner.appendChild(button);
    document.body.appendChild(banner);
  }

  navigator.serviceWorker.register("./service-worker.js")
    .then(function (registration) {
      function checkForUpdate() {
        if (navigator.onLine) {
          registration.update().catch(function () {});
        }
      }

      checkForUpdate();
      window.addEventListener("online", checkForUpdate);

      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdateNotice(registration.waiting);
      }

      registration.addEventListener("updatefound", function () {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", function () {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdateNotice(newWorker);
          }
        });
      });
    })
    .catch(function (error) {
      console.error("Lỗi đăng ký Service Worker:", error);
    });

  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (sessionStorage.getItem("cam-nang-update-approved") === "yes") {
      sessionStorage.removeItem("cam-nang-update-approved");
      window.location.reload();
    }
  });
});
