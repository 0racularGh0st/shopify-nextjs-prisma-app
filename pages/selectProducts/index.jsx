import {
    Button,
    Card,
    Checkbox,
    Layout,
    Page,
    Text,
    BlockStack,
    IndexTable,
    useIndexResourceState,
    Thumbnail,
    Toast,
    Frame,
    Modal,
    InlineStack,
  } from "@shopify/polaris";
  import {
    CheckCircleIcon, ClockIcon
  } from '@shopify/polaris-icons';
  import { useRouter } from "next/router";
  import { useEffect, useState, useCallback, useMemo } from "react";
  import { useDataFetcher } from "@/common/hooks/useDataFetcher";
  import { ImageIcon } from "@shopify/polaris-icons";
  import { useGetActivations } from "@/common/hooks/useGetActivations";
  import { useGetShopifyProducts } from "@/common/hooks/useGetShopifyProducts";
  import { useStoreProduct } from "@/common/hooks/useStoreProduct";
  import { useUpdateProduct } from "@/common/hooks/useUpdateProduct";
  import RichTextEditor from "@/components/editor";
  import { arraysEqual } from "@/common/utils/helpers";

  const SelectProductsIndex = () => {
    const { activations } = useGetActivations();
    const { shopifyProducts, refetchShopifyProducts, isLoading: isFetchingShopifyProducts } = useGetShopifyProducts();
    const { storeProduct, isStoringProduct } = useStoreProduct();
    const { updateProduct, isUpdatingProduct } = useUpdateProduct();
    console.log({ activations, shopifyProducts });
    const resourceName = {
      singular: 'product',
      plural: 'products',
    };
    const router = useRouter();

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [products, fetchProducts, isLoading] = useDataFetcher({ products: []}, "/api/apps/brand/brandProducts");
    const [publishData, publishProduct, isPublishing] = useDataFetcher({}, "/api/apps/brand/publishProducts");
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');
    const [toastError, setToastError] = useState(false);
    const [selectedProductForPublish, setSelectedProductForPublish] = useState('');
    const [selectedProductForPublishId, setSelectedProductForPublishId] = useState('');
    const [checkedForOnlineStore, setCheckedForOnlineStore] = useState(false);
    const [checkForActivations, setCheckForActivations] = useState(false);
    const [selectedActivations, setSelectedActivations] = useState(new Set());
    const [selectedProductDescription, setSelectedProductDescription] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState({});
    const handleChange = useCallback(() => setModalOpen(!modalOpen), [modalOpen]);

    const allowSave = useMemo(() => {
      let result = false;
      const platformProduct = shopifyProducts.find((product) => product.productId === selectedProductForPublishId);
      console.log({ selectedProduct, shopifyProducts, newDescription, selectedProductDescription, selectedActivations, checkedForOnlineStore, checkForActivations, platformProduct})
      if (!platformProduct && !checkedForOnlineStore && !checkForActivations) {
        return false;
      }
      if (!platformProduct && checkedForOnlineStore && newDescription !== selectedProductDescription) {
        result = true;
      }
      const selectedActivationsArray = Array.from(selectedActivations);
      if ((!platformProduct || !platformProduct?.activationIds) && checkForActivations && selectedActivationsArray?.length > 0) {
        result = true;
      }
      if (platformProduct && platformProduct?.activationIds && platformProduct?.activationIds?.length > 0 && !arraysEqual(selectedActivationsArray, platformProduct?.activationIds)) {
        result = true;
      }
      if (platformProduct && platformProduct?.onlineStore !== checkedForOnlineStore) {
        result = true;
      }
      if (platformProduct && checkedForOnlineStore && newDescription !== selectedProductDescription) {
        result = true;
      }
      if (platformProduct && !checkForActivations && platformProduct?.activationIds?.length > 0) {
        result = true;
      }
      console.log({ result });
      return result;
    }, [selectedProduct, shopifyProducts, newDescription, selectedProductDescription, selectedActivations, checkedForOnlineStore, checkForActivations ]);
    useEffect(() => {
      fetchProducts();
    }, []);


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

    

    
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products?.products || []);

    useEffect(() => {
      const selected = products?.products?.filter((product) => selectedResources.includes(product.id));
      setSelectedProducts(selected);
    }, [selectedResources]);

    const publishHandler = async (event, product) => {
      event?.preventDefault();
      event?.stopPropagation();

      const { id, title, descriptionHtml } = product;
      const platformProduct = shopifyProducts.find((shopifyProduct) => shopifyProduct.productId === id);
      const activationIds = platformProduct?.activationIds || [];
      setSelectedProductForPublish(title);
      setSelectedProductForPublishId(id);
      setSelectedProductDescription(platformProduct?.description ?? descriptionHtml);
      setSelectedProduct(product);
      setCheckedForOnlineStore(!!platformProduct?.onlineStore); //have to initialise with the selected product's value
      setCheckForActivations(!!platformProduct?.activationIds); //have to initialise with the selected product's value
      setSelectedActivations(new Set(activationIds)); //have to initialise with the selected product's value
      setModalOpen(true);
    }
    const resetStates = () => {
      setSelectedProductForPublish('');
      setSelectedProductForPublishId('');
      setSelectedProductDescription('');
      setSelectedProduct({});
      setCheckedForOnlineStore(false);
      setCheckForActivations(false);
      setSelectedActivations(new Set());
    }
    const handlePublishModalClose = () => {
      setModalOpen(false);
      resetStates();
    }
    const handlePublishModalSubmit = async (onlineStore, activations, newDescription, product) => {
      const { resourcePublicationOnCurrentPublication, admin_graphql_api_id } = product;
      let isError = false;
      //Publish product to sales channel if it hasn't been published yet
      if (!resourcePublicationOnCurrentPublication) {
        const postOptions = {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ productId: admin_graphql_api_id }),
        };
        try {
          await publishProduct(postOptions);
        } catch (error) {
          console.error({ error });
        }
      }
      
      const activationIds = Array.from(activations);
      console.log({ onlineStore, activationIds, newDescription, product });
      
      setModalOpen(false);
      // Store product if not added to platform
      const platformProduct = shopifyProducts.find((shopifyProduct) => shopifyProduct.productId === product.id);
      if (!platformProduct && !isError) {
        await storeProduct(product).then((storeProductRes) => {
          console.log({ storeProductRes });
        }).catch((error) => {
          console.error({ error });
          isError = true;
        });
      }
      //Update Product
      if (!isError) {
        const payload = {
          productId: product.id,
          description: newDescription,
          onlineStore,
          activationIds,
        }
        await updateProduct(payload).then((updateProductRes) => {
          console.log({ updateProductRes });
        }).catch((error) => {
          console.error({ error });
          isError = true;
        });
      }
      if (isError) {
        refetchShopifyProducts();
        setToastContent(`Failed to publish ${title}.`);
        setToastError(true);
        setToastActive(true);
        resetStates();
        return;
      }
      refetchShopifyProducts();
      setToastContent(`${selectedProductForPublish} published successfully!`);
      setToastError(false);
      setToastActive(true);
      resetStates();
    }

    const toastMarkup = toastActive && (
      <Toast
        content={toastContent}
        error={toastError}
        onDismiss={() => setToastActive(false)}
      />
    );
    const rowMarkup = products?.products?.map(
      (product, index) => {
        const { id, title, variants,image, images, resourcePublicationOnCurrentPublication } = product;
        const isAddedToOmniChannel = resourcePublicationOnCurrentPublication;
        const platformProduct = shopifyProducts.find((shopifyProduct) => shopifyProduct.productId === id);
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
          <IndexTable.Cell>{isAddedToOmniChannel ? 'Yes' : 'No'}</IndexTable.Cell>
          <IndexTable.Cell>
            <BlockStack>
              {platformProduct ? 
              (<BlockStack>
                <InlineStack wrap={false}>
                  <CheckCircleIcon fill="green" width={20} height={20}  style={{ marginRight: '6px'}}/>
                  <Text>Added to OmniChannel</Text>
                </InlineStack>
                  <InlineStack wrap={false}>
                    {platformProduct?.status === 'pending' && <ClockIcon fill="gray" width={20} height={20}  style={{ marginRight: '6px'}}/>}
                    <Text>Status:</Text>
                    <div style={{ textTransform: 'capitalize', marginLeft: '6px', fontWeight: "bold" }}>{platformProduct?.status}</div>
                  </InlineStack>
              </BlockStack>)
              : (<InlineStack>
                {/* //Add icon */}
                <Text>Not Added to OmniChannel</Text>
              </InlineStack>)}
            </BlockStack>
          </IndexTable.Cell>
           <IndexTable.Cell>
              <Button
                variant="primary"
                onClick={(e) => publishHandler(e, product)}
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
                { title: 'Inventory' },
                { title: 'Published to Sales Channel' },
                { title: 'Omnichannel Status' },
                { title: 'Actions'}
              ]}
              loading={isLoading || isFetchingShopifyProducts || isStoringProduct || isUpdatingProduct}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
            
          </Card>
            {selectedProducts?.length > 0 && (
              <Card>
              <BlockStack gap="200">
                <Text fontWeight="bold">Selection JSON</Text>
                <pre>{JSON.stringify(selectedProducts, null, 2)}</pre>
              </BlockStack>
            </Card>
            )}
          </Layout.Section>
          <Modal
            open={modalOpen}
            onClose={handleChange}
            title="Publish to LDC Online Store / Activations"
            primaryAction={{
              content: 'Save',
              disabled: !allowSave,
              onAction: () => handlePublishModalSubmit(checkedForOnlineStore, selectedActivations, newDescription, selectedProduct),
            }}
            secondaryActions={[
              {
                content: 'Cancel',
                onAction: handlePublishModalClose,
              },
            ]}
          >
            <Modal.Section>
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
                    <div style={{ padding: '8px 0px', height: '212px', marginBottom: '16px' }}>
                        <RichTextEditor initialHtml={selectedProductDescription} setHtml={setNewDescription} />
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
                </BlockStack>
              </div>
            </Modal.Section>
        </Modal>
          </Layout>
        </Page>
        {toastMarkup}
      </Frame>
    );
  };
  
export default SelectProductsIndex;
  