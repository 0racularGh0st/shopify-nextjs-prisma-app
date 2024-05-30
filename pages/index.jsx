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
} from "@shopify/polaris";
// import { ExternalIcon } from "@shopify/polaris-icons";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  //DO NOT REMOVE THIS.
  return await isInitialLoad(context);
}

const HomePage = () => {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";

  return (
    <>
      <Page title="Home">
        <Layout>
        <Layout.Section variant="fullWidth">
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
          </Layout.Section>
          {isDev ? (
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
          
        </Layout>
      </Page>
    </>
  );
};

export default HomePage;
