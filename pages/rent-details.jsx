import { useState, useMemo, useCallback, useContext } from "react";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button, Input, Banner } from "../components";
import images from "../assets";
import { NFTContext } from "../context/NFTcontext";
import { shortenAddress } from "../utils/shortenAddress";
export default function CreateNFT() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

  const router = useRouter();

  const { uploadToIPFS, createNFT, currentAccount } = useContext(NFTContext);
  const { theme } = useTheme();

  const onDrop = useCallback(async (acceptedFile) => {
    //Upload to IPFS
    const url = await uploadToIPFS(acceptedFile[0]);
    console.log({ url });
    setFileUrl(url);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 5000000,
  });

  // File style

  const fileStyle = useMemo(
    () => `
  dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col items-center p-5 rounded-sm border-dashed
${isDragActive && "border-file-active"}
${isDragAccept && "border-file-accept"}
${isDragReject && "border-file-reject"}

  `,
    [isDragActive, isDragAccept, isDragReject]
  );

  return (
    <div className="flex flex-col justify-center sm:px-4 p-12 flexBetween">
      <div className="w-full flexCenter flex-col">
        <Banner
          banner="Rent Manager"
          childStyles="text-center mb-4"
          parentStyles="h-80 justify-center"
        />
        <div className="flexCenter flex-col -mt-20 z-0">
          <div className="flexCenter w-40 h-40 sm:w-36 sm:h-36 p-1 bg-nft-black-2 rounded-full">
            <Image
              src={images.creator1}
              className="rounded-full object-cover"
              objectFit="cover"
            />
          </div>
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl mt-6 ">
            {shortenAddress(currentAccount)}
          </p>
        </div>
      </div>

      <div className="w-3/5 md:w-full mt-5 justify-center">
        <div className="mt-16">
          {/* <p className=" font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">
            Upload File
          </p> */}
          {/* <div className="mt-4">
            <div {...getRootProps()} className={fileStyle}>
              <input {...getInputProps()} />
              <div className="flexCenter flex-col text-center">
                <p className=" font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">
                  JPG,PNG,GIF,SVG,WEBM. Max 100mb.
                </p>
                <div className="my-12 w-full flex justify-center">
                  <Image
                    src={images.upload}
                    width={100}
                    height={100}
                    objectFit="contain"
                    alt="file upload"
                    className={theme === "light" && "filter invert"}
                  />
                </div>
                <p className=" font-poppins dark:text-white text-nft-black-1 font-semibold text-sm">
                  Drag and Drop File
                </p>
                <p className=" font-poppins dark:text-white text-nft-black-1 font-semibold text-sm mt-2">
                  or Browse media on your device
                </p>
              </div>
            </div>
            {fileUrl && (
              <aside>
                <div className="">
                  <img src={fileUrl} alt="asset_file" />
                </div>
              </aside>
            )}
          </div> */}
        </div>
        <Input
          inputType="input"
          title="Register Tenant"
          placeholder="Tenant Address"
          handleClick={(e) =>
            setFormInput({ ...formInput, name: e.target.value })
          }
        />
        <Input
          inputType="textarea"
          title="Description"
          placeholder="Describe your Tenant"
          handleClick={(e) =>
            setFormInput({ ...formInput, description: e.target.value })
          }
        />
        <Input
          inputType="number"
          title="Set Rent"
          placeholder="Rent Price"
          handleClick={(e) =>
            setFormInput({ ...formInput, price: e.target.value })
          }
        />
        {/* <Input
          inputType="number"
          title="Quantity"
          placeholder="No of Tokens"
          handleClick={(e) =>
            setFormInput({ ...formInput, quantity: e.target.value })
          }
        /> */}

        <div className="mt-7 w-full flex justify-end">
          <Button
            btnName="Create Tenant"
            classStyles="rounded-xl"
            handleClick={() => createNFT(formInput, fileUrl, router)}
          />
        </div>
      </div>
    </div>
  );
}
