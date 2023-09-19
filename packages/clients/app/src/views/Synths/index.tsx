import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { SynthsDataProps } from "../../hooks/views/useSynths";

import { RC as AddIcon } from "../../assets/icons/add.svg";

import { SynthsGallery } from "../../components/Synths/Gallery";
import { SynthsMintDialog } from "../../components/Synths/MintDialog";

interface SynthsProps extends SynthsDataProps {}

const Synths: React.FC<SynthsProps> = ({ synths, address, ...synthProps }) => {
  const navigate = useNavigate();
  const location = useLocation();

  function handleItemClick(item: Synth | Wave) {
    if ("organizer" in item) {
      navigate(`/synths/${item.id}`);
    }
  }

  return (
    <section className={`relative w-full h-full`}>
      {location.pathname === "/synths" ? (
        address ? (
          <div
            className={`flex flex-col w-full h-full items-center gap-3 px-6 pt-16 pb-20`}
          >
            <label
              htmlFor="synths-mint-dialog"
              className={`dark:fill-white fill-black absolute right-6 top-2 grid place-items-center w-12 h-12 unselectable`}
            >
              <AddIcon />
            </label>
            <SynthsGallery
              items={synths}
              view="synths"
              onItemClick={handleItemClick}
            />
          </div>
        ) : (
          <h4 className="w-full h-full grid place-items-center text-center">
            Connect Wallet To Mint Synths
          </h4>
        )
      ) : null}
      <Outlet />
      <SynthsMintDialog address={address} {...synthProps} />
    </section>
  );
};

export default Synths;
