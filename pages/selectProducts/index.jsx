import {
    Button,
    Card,
    InlineStack,
    Layout,
    Page,
    Text,
    BlockStack,
    IndexTable,
    useIndexResourceState,
    Thumbnail,
    Toast,
    Frame,
  } from "@shopify/polaris";
  import { useRouter } from "next/router";
  import { useEffect, useState } from "react";
  import { useDataFetcher } from "@/common/hooks/useDataFetcher";
  import { ImageIcon } from "@shopify/polaris-icons";
  // const isDebug = false;
  const publicationId = "gid://shopify/Publication/234266919215";
  const SelectProductsIndex = () => {
    const resourceName = {
      singular: 'product',
      plural: 'products',
    };
    const router = useRouter();
    const [productsJson, setProductsJson] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [products, fetchProducts, isLoading] = useDataFetcher({ products: []}, "/api/apps/brand/brandProducts");
    const [publishData, publishProduct, isPublishing] = useDataFetcher({}, "/api/apps/brand/publishProducts");
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');
    const [toastError, setToastError] = useState(false);
    
    useEffect(() => {
      fetchProducts();
    }, []);
    useEffect(() => {
      console.log({ products });
      if (products) {
        setProductsJson(JSON.stringify(products, null, 2));
      }
    }, [products])
    
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products?.products || []);

    useEffect(() => {
      const selected = products?.products?.filter((product) => selectedResources.includes(product.id));
      setSelectedProducts(selected);
    }, [selectedResources]);

    const publishHandler = async (event,productId, title = '') => {
      event?.preventDefault();
      event?.stopPropagation();
      const postOptions = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ productId }),
      };
      try {
        const res = await publishProduct(postOptions);
        console.log({ res });
        if (res.success) {
          setToastContent(`${title} published successfully!`);
          setToastError(false);
        } else {
          setToastContent(`Failed to publish ${title}.`);
          setToastError(true);
        }
        setToastActive(true);
      } catch (e) {
        console.error({ e });
      }
    }
    const toastMarkup = toastActive && (
      <Toast
        content={toastContent}
        error={toastError}
        onDismiss={() => setToastActive(false)}
      />
    );
    const rowMarkup = products?.products?.map(
      ({ id, title, descriptionHtml, variants, status, images, resourcePublicationOnCurrentPublication }, index) => {
        return (
          <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources.includes(id)}
          position={index}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={images && images[0]?.src || ImageIcon}
              alt={images && images[0]?.altText || ''}
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="strong">{title}</Text>
          </IndexTable.Cell>
          {/* <IndexTable.Cell>{descriptionHtml}</IndexTable.Cell> */}
          <IndexTable.Cell>
            {/* {variants.map((variant) => variant.title).join(', ')} */}
            {variants.map((variant) => (
              <Text key={variant.id}>
                {variant.title}
              </Text>
            ))}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {variants.reduce(
              (acc, variant) => acc + variant.inventoryQuantity,
              0
            )}
          </IndexTable.Cell>
          <IndexTable.Cell>{status}</IndexTable.Cell>
          <IndexTable.Cell>
            {resourcePublicationOnCurrentPublication?.publication?.id === publicationId ? (
              <Button variant="disabled">Published</Button>
            ) : (
              <Button
              variant="primary"
              onClick={(e) => publishHandler(e, id, title)}
              disabled={isPublishing}
            >
              Publish to online store
            </Button>
            )}
          </IndexTable.Cell>
        </IndexTable.Row>
        )
      }
    );
    
    return (
      <Frame>
        <Page
          title="Select Products"
          subtitle="Select products for Online Store and Activations"
          backAction={{ onAction: () => router.push("/") }}
        >
          <Layout>
          <Layout.Section>  
          <Card>
            <IndexTable
              resourceName={resourceName}
              itemCount={products?.products?.length}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: 'Image' },
                { title: 'Product name' },
                // { title: 'Product description' },
                { title: 'Product variants' },
                { title: 'Current inventory' },
                { title: 'Status' },
                { title: 'Actions'}
              ]}
              loading={isLoading}
            >
              {rowMarkup}
            </IndexTable>
            
          </Card>
           {/* <Card>
              <BlockStack gap="200">
                <Text fontWeight="bold">Selection JSON</Text>
                <pre>{productsJson}</pre>
              </BlockStack>
            </Card> */}
            {selectedProducts?.length > 0 && (
              <Card>
              <BlockStack gap="200">
                <Text fontWeight="bold">Selection JSON</Text>
                <pre>{JSON.stringify(selectedProducts, null, 2)}</pre>
              </BlockStack>
            </Card>
            )}
          </Layout.Section>
          </Layout>
        </Page>
        {toastMarkup}
      </Frame>
    );
  };
  
export default SelectProductsIndex;
  