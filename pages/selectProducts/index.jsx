import {
    Button,
    Card,
    Checkbox,
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
    TextField,
  } from "@shopify/polaris";
  import { useRouter } from "next/router";
  import { useEffect, useState, useCallback } from "react";
  import { useDataFetcher } from "@/common/hooks/useDataFetcher";
  import { ImageIcon } from "@shopify/polaris-icons";
  import {Modal, TitleBar, useAppBridge} from '@shopify/app-bridge-react';
  import { useGetActivations } from "@/common/hooks/useGetActivations";
  import { useAuth } from "@/common/hooks/useAuth";
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
    const [selectedProductForPublish, setSelectedProductForPublish] = useState('');
    const [checkedForOnlineStore, setCheckedForOnlineStore] = useState(false);
    const [checkForActivations, setCheckForActivations] = useState(false);
    const [selectedActivations, setSelectedActivations] = useState(new Set());
    const [newDescription, setNewDescription] = useState('');
    useEffect(() => {
      console.log({ selectedActivations });
    }, [selectedActivations])
    const { getActivations, activations } = useGetActivations();

    const shopify = useAppBridge();
    const {clubhouseUser} = useAuth();
    const handleCheckedForOnlineStore = useCallback(
      (newChecked) => setCheckedForOnlineStore(newChecked),
      [],
    );
    const handleCheckedForActivations = useCallback(
      (newChecked) => setCheckForActivations(newChecked),
      [],
    );

    const handleCheckedForSelectedActivations = useCallback(
      (newChecked, activationId) => {
        console.log({ newChecked, activationId });
        const checkedActivations = new Set(selectedActivations);
        if (newChecked) {
          checkedActivations.add(activationId);
        } else {
          checkedActivations.delete(activationId);
        }
        setSelectedActivations(checkedActivations);
      }, [selectedActivations]);
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

    const publishHandler = async (event, productId, title = '') => {
      event?.preventDefault();
      event?.stopPropagation();
      setSelectedProductForPublish(title);
      // Add product to sales channel
      // const postOptions = {
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json",
      //   },
      //   method: "POST",
      //   body: JSON.stringify({ productId }),
      // };
      // try {
      //   const res = await publishProduct(postOptions);
      //   console.log({ res });
        
      // } catch (e) {
      //   console.error({ e });
      //   setToastContent(`Failed to publish ${title}.`);
      //   setToastError(true);
      //   setToastActive(true);
      // }
      // Open Modal
      if (!clubhouseUser?.token) {
        return;
      }
      await getActivations(clubhouseUser?.token);
      setCheckedForOnlineStore(false); //have to initialise with the selected product's value
      setCheckForActivations(false); //have to initialise with the selected product's value
      setSelectedActivations(new Set()); //have to initialise with the selected product's value
      shopify.modal.show('publish-modal');
      //code to use fr success
      // if (res.success) {
      //   setToastContent(`${title} published successfully!`);
      //   setToastError(false);
      // } else {
      //   setToastContent(`Failed to publish ${title}.`);
      //   setToastError(true);
      // }
      // setToastActive(true);
      // End of code to use
    }
    const handlePublishModalClose = () => {
      shopify.modal.hide('publish-modal');
      setSelectedProductForPublish('');
    }
    const handlePublishModalSubmit = (onlineStore, activations) => {
      console.log({ onlineStore, activations });
      shopify.modal.hide('publish-modal');

      //TODO: remove later
      setToastContent(`${selectedProductForPublish} published successfully!`);
      setToastError(false);
      setToastActive(true);
      setSelectedProductForPublish('');
    }
    const toastMarkup = toastActive && (
      <Toast
        content={toastContent}
        error={toastError}
        onDismiss={() => setToastActive(false)}
      />
    );
    const rowMarkup = products?.products?.map(
      ({ id, title, adminGraphqlApiId, variants,image, images, resourcePublicationOnCurrentPublication }, index) => {
        return (
          <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources.includes(id)}
          position={index}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={image?.src || images && images[0]?.src || ImageIcon}
              alt={''}
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="strong">{title}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
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
          <IndexTable.Cell>N/A</IndexTable.Cell>
          {/* <IndexTable.Cell>
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
          </IndexTable.Cell> */}
           <IndexTable.Cell>
              <Button
                variant="primary"
                onClick={(e) => publishHandler(e, adminGraphqlApiId, title)}
                disabled={isPublishing}
              >
                Add to online store / Activations
              </Button>
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
          fullWidth
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
                { title: 'Product variants' },
                { title: 'Current inventory' },
                { title: 'Omnichannel Status' },
                { title: 'Actions'}
              ]}
              loading={isLoading}
              selectable={false}
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
          <Modal id="publish-modal" variant="base">
            <div style={{ maxWidth: '600px', padding: '24px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
              <Text>Where do you want to publish <strong>{selectedProductForPublish}</strong> to ? </Text>
              </div>
              <BlockStack align="center" inlineAlign="left">
                <Checkbox
                  label="Online Store"
                  checked={checkedForOnlineStore}
                  onChange={handleCheckedForOnlineStore}
                />
                {
                  checkedForOnlineStore && 
                   <div style={{ padding: '8px 0px'}}>
                      <TextField
                        value={newDescription}
                        onChange={setNewDescription}
                        label="Description"
                        type="text"
                        helpText={
                          <span>
                            A slightly different description for SEO purposes
                          </span>
                        }
                      size="medium"
                    / >
                   </div>
                  }
                <Checkbox
                  label="Activations"
                  checked={checkForActivations}
                  onChange={handleCheckedForActivations}
                />
                {checkForActivations && activations.length > 0 && (
                  <div style={{ padding: '16px' }}>
                    <Text>Which Activations do you want to sell the product in ?</Text>
                      <BlockStack align="center" inlineAlign="left">
                        {activations.map((activation) => {
                          console.log({ activation });
                          return <Checkbox
                            key={activation.activationId}
                            label={activation.name}
                            checked={selectedActivations.has(activation.activationId)}
                            onChange={(newChecked) => handleCheckedForSelectedActivations(newChecked, activation.activationId)}
                          />
                        })}
                      </BlockStack>
                  </div>
                )}
                <div style={{ marginTop: "16px"}}>
                <InlineStack gap="200">
                  <Button variant="tertiary" tone="critical" onClick={handlePublishModalClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => handlePublishModalSubmit(checkedForOnlineStore, selectedActivations)}>
                    Publish
                  </Button>
                </InlineStack>
                </div>
              </BlockStack>
            </div>
            <TitleBar title={`Publish to LDC Store`}>
              {/* <button style={{ backgroundColor: 'red'}} onClick={handlePublishModalClose}>Cancel</button> */}
            </TitleBar>
          </Modal>
          </Layout>
        </Page>
        {toastMarkup}
      </Frame>
    );
  };
  
export default SelectProductsIndex;
  