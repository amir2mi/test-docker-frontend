import { getChart, saveNewChart } from "./src/api";
import { isTokenExpired } from "./src/api/auth";
import Datafeed from "./src/datafeed";
import Cookies from "js-cookie";
import { handleSaveChart } from "./src/helpers";
import queryString from "query-string";
import { createHeaderButton } from "./src/domHelpers";

const websiteAddress = import.meta.env["VITE_WEBSITE_URL"];
const givenOptions = queryString.parse(location.search);

window.tvWidget = new TradingView.widget({
  symbol: givenOptions?.symbol || "Binance:BTC/USDT",
  interval: givenOptions?.interval || "1D",
  fullscreen: true, // displays the chart in the fullscreen mode
  container: "tv_chart_container",
  datafeed: Datafeed,
  library_path: "./src/charting_library/",
  custom_css_url: "./styles.css",
  enabled_features: ["show_symbol_logos", "show_exchange_logos"],
  disabled_features: ["widget_logo", "use_localstorage_for_settings"],
  locale: "fa",
  custom_font_family: "vazirmatn, vazir",
  timezone: "Asia/Tehran",
  theme: "Dark",
  auto_save_delay: 3,
  widgetbar: {
    details: true,
    news: true,
    watchlist: true,
    datawindow: true,
    // watchlist_settings: {
    //   default_symbols: ["MSFT", "IBM", "AAPL"],
    // },
  },
  loading_screen: {
    backgroundColor: "#292929",
  },
  overrides: {
    "paneProperties.backgroundType": "solid",
    "paneProperties.background": "#292929",
    "paneProperties.vertGridProperties.color": "#343434",
    "paneProperties.horzGridProperties.color": "#343434",
    "symbolWatermarkProperties.transparency": 90,
    "scalesProperties.textColor": "#AAA",
    "mainSeriesProperties.candleStyle.upColor": "#01c290",
    "mainSeriesProperties.candleStyle.downColor": "#e82537",
  },
});

tvWidget.headerReady().then(function () {
  // Cookies.set(
  //   "token",
  //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiZjNjNTk2NTUtN2E1Ny00MGJlLWE0YTUtZjZjYjU2ODk0ZTQwIiwidXNlcm5hbWUiOiJhbWlyMm1pIiwiZXhwIjoxNjk0MDI4NDE3LCJlbWFpbCI6Im1haWwuYW1pcjJtaUBnbWFpbC5jb20ifQ.fw6d9cz-eMlGqD2VnyAaXNKKmFp2tG2Yby-HY0_7T_0"
  // );

  const hasAuth = !isTokenExpired();
  const setRedirectLocalStorage = () =>
    localStorage.setItem(
      "redirect_after_auth",
      JSON.stringify({ expiration: Date.now() + 600000, to: location.href || `${websiteAddress}/chart` })
    );

  if (hasAuth) {
    createHeaderButton(
      "پروفایل کاربری",
      "",
      () => {
        window.open(`${websiteAddress}/settings`, "_blank");
      },
      { id: "user-profile-info" }
    );

    tvWidget.subscribe("onAutoSaveNeeded", () => handleSaveChart());
    createHeaderButton("💾 ذخیره خودکار", "", () => handleSaveChart(true), { id: "saving-state-indicator" });
  } else {
    if (!localStorage.getItem("has_seen_chart_auth_dialog"))
      tvWidget.showNoticeDialog({
        title: "چارت پیشرفته هوکوبیت",
        body: "با ورود به حساب‌کاربری هوکوبیت از قابلیت ذخیره و بازیابی تغییرات چارت هر رمزارز بهره‌مند شوید.",
        callback: () => localStorage.setItem("has_seen_chart_auth_dialog", true),
      });
    createHeaderButton("🔑 ورود", "ورود به هوکوبیت", function () {
      setRedirectLocalStorage();
      window.location.href = `${websiteAddress}/auth`;
    });
    createHeaderButton("👥 ثبت‌نام", "ثبت‌نام در هوکوبیت", function () {
      setRedirectLocalStorage();
      window.location.href = `${websiteAddress}/auth/sign-up`;
    });
    createHeaderButton("درباره", "اطلاعات بیشتر", function () {
      tvWidget.showNoticeDialog({
        title: "چارت پیشرفته هوکوبیت",
        body: `با چارت پیشرفته هوکوبیت هوشمندانه معامله کنید.\nبا ورود به حساب‌کاربری هوکوبیت از قابلیت ذخیره و بازیابی تغییرات چارت هر رمزارز بهره‌مند شوید.`,
        callback: () => localStorage.setItem("has_seen_chart_auth_dialog", true),
      });
    });
  }
});

tvWidget.onChartReady(function () {});

// each chart data :)
// charts > panes > sources
// charts > timeScale

// user settings :)
// charts > chartProperties
