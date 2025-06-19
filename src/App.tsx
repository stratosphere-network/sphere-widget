import { useState, useEffect } from "react";
import "./App.css";
import { getRedirectLinks } from "./apis/sphereApi";
import type { RequestLinkRedirect } from "./apis/sphereApi";

interface DecodedData {
  intent: "request" | "send";
  id: string;
  amount: number | string;
  username: string;
  chain: string | null;
  token: string | null;
}

interface ParsedLinkData {
  type: "request_link" | "send_link";
  data: DecodedData;
  originalParam: string;
}

function App() {
  const [linkData, setLinkData] = useState<ParsedLinkData | null>(null);
  const [redirectLinks, setRedirectLinks] =
    useState<RequestLinkRedirect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Base64 decode function
  const base64Decode = (str: string): string => {
    try {
      return atob(str);
    } catch (e) {
      throw new Error("Invalid base64 encoding");
    }
  };

  // Fetch redirect links from API
  const fetchRedirectLinks = async () => {
    try {
      const links = await getRedirectLinks();
      console.log("Fetched redirect links:", links);
      setRedirectLinks(links);
      console.log("Fetched redirect links:", links);
    } catch (err) {
      console.error("Failed to fetch redirect links:", err);
      setError("Failed to load platform links. Please try again.");
    }
  };

  // Extract and parse the data parameter
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First fetch redirect links
        await fetchRedirectLinks();

        // Then parse URL data
        const searchParams = new URLSearchParams(window.location.search);
        const dataParam = searchParams.get("data");

        if (!dataParam) {
          setError("No data parameter found in URL");
          setIsLoading(false);
          return;
        }

        // Parse the data parameter format: request_link-${base64} or send_link-${base64}
        const linkTypeMatch = dataParam.match(
          /^(request_link|send_link)-(.+)$/
        );

        if (!linkTypeMatch) {
          setError(
            "Invalid data format. Expected: request_link-{base64} or send_link-{base64}"
          );
          setIsLoading(false);
          return;
        }

        const [, linkType, base64Data] = linkTypeMatch;

        // Decode base64 and parse JSON
        const decodedJson = base64Decode(base64Data);
        const parsedData: DecodedData = JSON.parse(decodedJson);

        // Validate required fields
        if (!parsedData.intent || !parsedData.id || !parsedData.username) {
          setError("Missing required fields in decoded data");
          setIsLoading(false);
          return;
        }

        setLinkData({
          type: linkType as "request_link" | "send_link",
          data: parsedData,
          originalParam: dataParam,
        });
      } catch (err) {
        console.error("Error initializing app:", err);
        setError("Failed to parse URL data. Please check the format.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Create URL with parameters for chosen platform
  const createPlatformUrl = (
    platform: "telegram" | "web" | "mobile"
  ): string => {
    if (!linkData || !redirectLinks) return "";

    const { originalParam, type } = linkData;

    // Choose the correct redirect object based on link type
    const redirectObject =
      type === "request_link"
        ? redirectLinks.requestRedirectLink
        : redirectLinks.sendLinkRedirect;

    switch (platform) {
      case "telegram":
        // Telegram uses ?startapp= parameter
        const telegramUrl = redirectObject?.telegram_url;
        return `${telegramUrl}?startapp=${originalParam}`;

      case "web":
        // Web uses ?data= parameter
        return `${redirectObject.url}?data=${originalParam}`;

      case "mobile":
        // Mobile uses ?data= parameter
        const mobileUrl = redirectObject.mobile_url || redirectObject.url;
        return `${mobileUrl}?data=${originalParam}`;

      default:
        return redirectObject.url;
    }
  };

  // Handle platform selection and redirect
  const handlePlatformSelect = (platform: "telegram" | "web" | "mobile") => {
    const url = createPlatformUrl(platform);

    if (!url) {
      setError("Platform URL not available");
      return;
    }

    console.log(`Redirecting to ${platform}:`, url);

    if (platform === "mobile") {
      // Try to open mobile app, fallback to web if not installed
      window.location.href = url;
      setTimeout(() => {
        // Fallback to web if mobile app doesn't open
        const webUrl = createPlatformUrl("web");
        if (webUrl) {
          window.location.href = webUrl;
        }
      }, 2500);
    } else {
      window.location.href = url;
    }
  };

  // Get display text based on link type and data
  const getDisplayInfo = () => {
    if (!linkData)
      return {
        title: "Choose Platform",
        subtitle: "Where would you like to continue?",
      };

    const { type, data } = linkData;
    const isRequest = type === "request_link";

    return {
      title: isRequest ? "Payment Request" : "Payment Received",
      subtitle: isRequest
        ? `${data.username} requested ${data.amount}${
            data.token ? ` ${data.token}` : ""
          } from you`
        : `${data.username} sent you ${data.amount}${
            data.token ? ` ${data.token}` : ""
          }`,
    };
  };

  if (isLoading) {
    return (
      <div className="widget-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-container">
        <div className="widget-content">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Error</h2>
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayInfo = getDisplayInfo();

  return (
    <div className="widget-container">
      <div className="widget-content">
        <div className="header">
          <h1 className="title">{displayInfo.title}</h1>
          <p className="subtitle">{displayInfo.subtitle}</p>
        </div>

        {linkData && (
          <div className="transaction-details">
            <div className="detail-row">
              <span className="label">Action:</span>
              <span className="value">
                {linkData.data.intent === "request"
                  ? "Pay Request"
                  : "Collect Payment"}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Amount:</span>
              <span className="value">
                {linkData.data.amount}
                {linkData.data.token && ` ${linkData.data.token}`}
                {linkData.data.chain && ` (${linkData.data.chain})`}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">
                {linkData.data.intent === "request"
                  ? "Requested by:"
                  : "Sent by:"}
              </span>
              <span className="value">{linkData.data.username}</span>
            </div>
            <div className="detail-row">
              <span className="label">Transaction ID:</span>
              <span className="value">{linkData.data.id}</span>
            </div>
          </div>
        )}

        <div className="platform-options">
          <button
            className="platform-button telegram"
            onClick={() => handlePlatformSelect("telegram")}
            disabled={
              !linkData ||
              !redirectLinks ||
              !(linkData.type === "request_link"
                ? redirectLinks.requestRedirectLink?.telegram_url
                : redirectLinks.sendLinkRedirect?.telegram_url)
            }
          >
            <div className="platform-icon">📱</div>
            <div className="platform-info">
              <h3>Telegram</h3>
              <p>
                {linkData?.data.intent === "request"
                  ? "Pay via Telegram Mini App"
                  : "Collect via Telegram Mini App"}
              </p>
            </div>
            <div className="chevron">›</div>
          </button>

          <button
            className="platform-button web"
            onClick={() => handlePlatformSelect("web")}
            disabled={
              !linkData ||
              !redirectLinks ||
              !(linkData.type === "request_link"
                ? redirectLinks.requestRedirectLink?.url
                : redirectLinks.sendLinkRedirect?.url)
            }
          >
            <div className="platform-icon">🌐</div>
            <div className="platform-info">
              <h3>Web Browser</h3>
              <p>
                {linkData?.data.intent === "request"
                  ? "Pay in your browser"
                  : "Collect in your browser"}
              </p>
            </div>
            <div className="chevron">›</div>
          </button>

          <button
            className="platform-button mobile"
            onClick={() => handlePlatformSelect("mobile")}
            disabled={
              !linkData ||
              !redirectLinks ||
              !(linkData.type === "request_link"
                ? redirectLinks.requestRedirectLink?.mobile_url ||
                  redirectLinks.requestRedirectLink?.url
                : redirectLinks.sendLinkRedirect?.mobile_url ||
                  redirectLinks.sendLinkRedirect?.url)
            }
          >
            <div className="platform-icon">📲</div>
            <div className="platform-info">
              <h3>Mobile App</h3>
              <p>
                {linkData?.data.intent === "request"
                  ? "Pay via mobile app"
                  : "Collect via mobile app"}
              </p>
            </div>
            <div className="chevron">›</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
