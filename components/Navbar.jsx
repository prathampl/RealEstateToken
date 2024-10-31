import { useState, useEffect, useContext } from "react";
import { NFTContext } from "../context/NFTcontext";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./";
import images from "../assets";

// helper component menu items

const MenuItems = ({ isMobile, active, setActive }) => {
  const generateLink = (i) => {
    switch (i) {
      case 0:
        return "/";
        break;
      case 1:
        return "/listed-nfts";
        break;
      case 2:
        return "/my-nfts";
      case 3:
        return "/rent-details";
      default:
        return "/";
    }
  };

  return (
    <ul
      className={`list-none flexCenter flex-row ${
        isMobile && "flex-col h-full"
      }`}
    >
      {["Explore Tokens", "Listed Tokens", "My Tokens", "Rent Manager"].map(
        (item, i) => (
          <li
            key={i}
            onClick={() => {
              setActive(item);
            }}
            className={`flex flex-row items-center font-poppins font-semibold text-base dark:hover:text-white hover:text-nft-dark mx-3 ${
              active === item
                ? "dark:text-white text-nft-black-1"
                : "dark:text-nft-gray-3 text-nft-gray-2"
            }`}
          >
            <Link href={generateLink(i)}>{item}</Link>
          </li>
        )
      )}
    </ul>
  );
};

// Button Group

const ButtonGroup = ({ setActive, router }) => {
  const { connectWallet, currentAccount } = useContext(NFTContext);

  return currentAccount ? (
    <Button
      btnName="Create"
      classStyles="mx-2 rounded-xl"
      handleClick={() => {
        setActive("");
        router.push("/create-nft");
      }}
    />
  ) : (
    <Button
      btnName="Connect"
      classStyles="mx-2 rounded-xl"
      handleClick={connectWallet}
    />
  );
};

const checkActive = (active, setActive, router) => {
  switch (router.pathname) {
    case "/":
      if (active != "Explore Tokens") setActive("Explore Tokens");
      break;
    case "/listed-nfts":
      if (active != "Listed Tokens") setActive("Listed Tokens");
      break;
    case "/my-nfts":
      if (active != "My Tokens") setActive("My Tokens");
      break;
    case "/create-nft":
      setActive("");
      break;
    case "/rent-details":
      setActive("Rent Manager");
      break;

    default:
      setActive("");
      break;
  }
};
export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [active, setActive] = useState("Explore NFTs");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkActive(active, setActive, router);
  }, [router.pathname]);

  return (
    <nav className="flexBetween w-full fixed dark:bg-nft-dark bg-white dark:border-nft-black-1 flex-row z-10 p-4 border-b border-nft-gray-1">
      <div className="flex flex-1 flex-row justify-start">
        <Link href="/">
          <div
            className="flexCenter md:hidden cursor-pointer"
            onClick={() => {}}
          >
            <Image
              src={images.logo02}
              objectFit="contain"
              width={32}
              height={32}
              alt="logo"
            />
            <p className="dark:text-white text-nft-black-1 font-semibold text-lg ml-1">
              PropSol
            </p>
          </div>
        </Link>
        <Link href="/">
          <div className="hidden md:flex" onClick={() => {}}>
            <Image
              src={images.logo02}
              objectFit="contain"
              width={32}
              height={32}
              alt="logo"
            />
          </div>
        </Link>
      </div>
      <div className="flex flex-initial flex-row justify-end">
        <div className="flex items-center mr-2">
          <input
            type="checkbox"
            className="checkbox"
            id="checkbox"
            onChange={() => setTheme(theme === "light" ? "dark" : "light")}
          ></input>
          <label
            htmlFor="checkbox"
            className="flexBetween bg-black w-8 h-4 rounded-2xl p-1 relative label"
          >
            <i className="fas fa-sun" />
            <i className="fas fa-moon" />
            <div className="w-3 h-3 absolute bg-white rounded-full ball"></div>
          </label>
        </div>
        <div className="md:hidden flex">
          <MenuItems active={active} setActive={setActive} />
          <div className="ml-4">
            <ButtonGroup setActive={setActive} router={router} />
          </div>
        </div>
      </div>
      <div className="hidden md:flex ml-2">
        {isOpen ? (
          <Image
            src={images.cross}
            objectFit="contain"
            height={20}
            width={20}
            alt="close"
            onClick={() => setIsOpen(false)}
            className={theme === "light" && "filter invert"}
          />
        ) : (
          <Image
            src={images.menu}
            objectFit="contain"
            height={25}
            width={25}
            alt="menu"
            onClick={() => setIsOpen(true)}
            className={theme === "light" && "filter invert"}
          />
        )}
        {isOpen && (
          <div className="fixed inset-0 top-65 dark:bg-nft-dark bg-white z-10 nav-h flex justify-between flex-col">
            <div className="flex-1 p-4">
              <MenuItems active={active} setActive={active} isMobile />
            </div>
            <div className="p-4 border-t dark:border-nft-black-1 border-nft-gray-1">
              <ButtonGroup setActive={setActive} router={router} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
