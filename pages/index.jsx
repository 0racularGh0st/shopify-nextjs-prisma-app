import isInitialLoad from "@/utils/middleware/isInitialLoad";
import {
  BlockStack,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
  Box,
  AccountConnection,
  Link,
  Form,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import {Modal, TitleBar, useAppBridge} from '@shopify/app-bridge-react';
// import { ExternalIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/icons/Logo";
import { useRouter } from "next/router";
import { useAuth } from "@/common/hooks/useAuth";
import { useSignIn } from "@/common/hooks/useSignIn";
import { useGetIsSubscribed } from "@/common/hooks/useGetIsSubscribed";

export async function getServerSideProps(context) {
  //DO NOT REMOVE THIS.
  return await isInitialLoad(context);
}

const HomePage = () => {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";
  const showDevComponents = false;
  const { clubhouseUser, setClubhouseUser } = useAuth();
  const [connected, setConnected] = useState(false);
  const isSubscribed = useGetIsSubscribed();
  const { signin, isLoading } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const shopify = useAppBridge();
  const accountName = "";
  
  useEffect(() => {
    if (clubhouseUser?.id) {
      setConnected(true);
      return;
    }
    setConnected(false);
  }, [clubhouseUser]);

  const handleModalOpen = async () => {
    shopify.modal.show('my-modal')
  };

  const handleSubmit = async () => {
    const res = await signin({email, password}).then((user) => {
      return user;
    }).catch((error) => {
      console.log({ error });
      return null;
    });
    
    if (res) {
      setClubhouseUser(res);
      setConnected(true);
    }
    shopify.modal.hide('my-modal')
}
  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePasswordChange = useCallback((value) => setPassword(value), []);
  
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
    <>
      <Page title="Home">
        <Layout>
        <Logo width={80} height={40} style={{ marginTop: "24px" }} />
        {connected && isSubscribed && <Layout.Section variant="fullWidth">
            <Card padding={0}>
              <BlockStack gap="200">
                <Box background="bg-fill-info">
                  <div
                    style={{ padding: "16px"}}
                  >
                    <Text as="h2" variant="headingMd">
                      Welcome to LDC Omnichannel! 
                    </Text>
                  </div>
                </Box>
                <div style={{ padding: "0px 16px 16px 16px"}}>
                  <Text>From here, you can select products you wish to feature on the LDC store and the Activations you are booked into.</Text>
                  <div style={{ marginTop: "16px "}}>
                    <InlineStack wrap={false} align="start">
                      <Button
                        variant="primary"
                        onClick={() => {
                          router.push("/selectProducts");
                        }}
                      >
                        Select Products
                      </Button>
                    </InlineStack>
                  </div>
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>}
          {connected && !isSubscribed && <Layout.Section variant="fullWidth">
            <Card padding={0}>
              <BlockStack gap="200">
                <Box background="bg-fill-critical">
                  <div
                    style={{ padding: "16px", color: "white" }}
                  >
                    <Text as="h2" variant="headingMd">
                      Welcome to LDC Omnichannel! 
                    </Text>
                  </div>
                </Box>
                <div style={{ padding: "0px 16px 16px 16px"}}>
                  <Text>It seems like you don't have an Active Clubhouse subscription to access Omnichannel Features. Please subscribe to Clubhouse or Renew your subscription!</Text>
                  <div style={{ marginTop: "16px "}}>
                    <InlineStack wrap={false} align="start">
                      <Button
                        variant="primary"
                        onClick={() => {
                          window.open('https://lonedesignclub-web-uat.vercel.app/', '_blank');
                        }}
                      >
                        Subscribe to Clubhouse
                      </Button>
                    </InlineStack>
                  </div>
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>}
          {!connected && <Layout.Section variant="fullWidth">
          <AccountConnection
            accountName={accountName}
            connected={connected}
            title="Lone Design
            Club"
            action={{
                content: buttonText,
                onAction: handleModalOpen,
            }}
            details={details}
            termsOfService={terms}
        />
          </Layout.Section>}
          {isDev && showDevComponents ? (
            <Layout.Section variant="fullWidth">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Debug Cards (This is only visible in dev mode)
                  </Text>
                  <Text>
                    Explore how the repository handles data fetching from the
                    backend, App Proxy, making GraphQL requests, Billing API and
                    more. This will only be visible in dev mode.
                  </Text>
                  <InlineStack wrap={false} align="end">
                    <Button
                      variant="primary"
                      onClick={() => {
                        router.push("/debug");
                      }}
                    >
                      Debug Cards
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          ) : null}
          
          <Modal id="my-modal" variant="base">
            <BlockStack align="center" inlineAlign="center">
              <Logo width={80} height={40} style={{ marginTop: "24px" }} />
              <div style={{ maxWidth: '400px', padding: '48px' }}>
                <Form onSubmit={handleSubmit}>
                  <FormLayout>
                    <TextField
                      value={email}
                      onChange={handleEmailChange}
                      label="Email"
                      type="email"
                      autoComplete="email"
                      helpText={
                        <span>
                          Enter the email associated with your Clubhouse Account
                        </span>
                      }
                      size="medium"
                    />
                    <TextField
                      value={password}
                      onChange={handlePasswordChange}
                      label="Password"
                      type="password"
                      size="medium"
                    />
                    <InlineStack align="center">
                      <Button
                      submit
                      variant="primary"
                      disabled={!email || !password}
                      >
                        Submit
                      </Button>
                    </InlineStack>
                  </FormLayout>
              </Form>
              </div>
            </BlockStack>
            <TitleBar title="Connect to LDC Clubhouse">
              <button style={{ backgroundColor: 'red'}} onClick={() => shopify.modal.hide('my-modal')}>Cancel</button>
            </TitleBar>
          </Modal>
        </Layout>
      </Page>
    </>
  );
};

export default HomePage;
