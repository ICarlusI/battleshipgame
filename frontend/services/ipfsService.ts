import axios from "axios";
import { resolve } from "path";


class IPFSService {
    testAuthentication = () => {
        const url = `https://api.pinata.cloud/data/testAuthentication`;
        return axios
            .get(url, {
                headers: {
                    pinata_api_key: "ad6e9681e5c72a387c02",
                    pinata_secret_api_key: "7f9c75be2e96ab5792c09f2af5c152cb647b908c6d3324b6e3426eac35023367"
                }
            })
            .then(function (response) {
                console.log('Resp ', response)
            })
            .catch(function (error) {
                //handle error here
                console.log('error ', error)
            });
    }

    pinFileToIPFS = async (selectedFile:any) => {
        console.log('IMAGE TO UPLOAD: ', selectedFile)
        const metadata = JSON.stringify({
            name: selectedFile.name || 'imageName',
            keyvalues: {
                accountId: '0x000'
            }
        });
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        //we gather a local file from the API for this example, but you can gather the file from anywhere
        // Update the formData object
        const formData = new FormData();
        formData.append( "file",selectedFile, `${selectedFile.name}`);
        formData.append('pinataMetadata', metadata);

        const response = await axios.post(url,
            formData,
            {
                headers: {
                    'Content-Type': `multipart/form-data; ; boundary=${formData._boundary}`,
                    pinata_api_key : "ad6e9681e5c72a387c02",
                    pinata_secret_api_key: "7f9c75be2e96ab5792c09f2af5c152cb647b908c6d3324b6e3426eac35023367"
                }
            }
        )
        return response;
    };


}

const ipfsService = new IPFSService();

export { ipfsService }