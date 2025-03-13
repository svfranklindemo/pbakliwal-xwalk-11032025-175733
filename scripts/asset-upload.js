export function uploadAsset() {
    const defaultPayload = {
        projectName: "defaultName",
        type: "xwlak-copilot-assisted",
        userLdap:"pbakliwal",
        aemURL:"https://author-p121371-e1189853.adobeaemcloud.com/",
        images: [
            {
                importedUrl: "https://d3e5s7kqhuzljs.cloudfront.net/36F17006660AF1130A495CAB@821b1f78631c0ced495c57.e/images/22eea5d3-545c-48d7-bb7c-5b5adebc40c2/8f004eb1-8b18-4d99-ad5e-10ba6d5482f4.jpg",
                pathToModify: "defaultPath",
                name: "8f004eb1-8b18-4d99-ad5e-10ba6d5482f4.jpg"
            }
        ]
    };

    //const payload = { ...defaultPayload, ...updates };
    console.log("payload for assets:", payload);

    return fetch('https://localhost:9080/api/v1/web/dx-excshell-1/assets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultPayload)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        return data;
    })
    .catch(error => {
        console.error('Error:', error);
        throw error;
    });
}