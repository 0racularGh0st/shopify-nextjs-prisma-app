import { AccountConnection, Link, Page } from "@shopify/polaris";
import { useCallback, useState } from "react";

const ConnectIndex = () => {
  const [connected, setConnected] = useState(false);
  const accountName = "";

  const handleAction = useCallback(() => {
    setConnected((connected) => !connected);
  }, []);

  const buttonText = connected ? "Disconnect" : "Connect";
  const details = connected ? "Account connected" : "No account connected";
  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you agree to accept the Lone Design
      Club’s{" "}
      <Link url="https://lonedesignclub.com/policies/terms-of-service">
        terms and conditions
      </Link>
      . You’ll pay a commission rate of 15% on sales made through Lone Design
      Club.
    </p>
  );

  return (
    <Page title="Connect">
        <AccountConnection
            accountName={accountName}
            connected={connected}
            title="Lone Design
            Club"
            action={{
                content: buttonText,
                onAction: handleAction,
            }}
            details={details}
            termsOfService={terms}
        />
    </Page>
  );
}

export default ConnectIndex;