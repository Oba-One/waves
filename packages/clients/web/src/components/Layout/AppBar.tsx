import { a, config, useSpring } from "@react-spring/web";
import { Link, useLocation } from "react-router-dom";

import { RC as HouseIcon } from "../../assets/icons/house.svg";
import { RC as MarketIcon } from "../../assets/icons/market.svg";
import { RC as ProfileIcon } from "../../assets/icons/profile.svg";

const tabs: {
  path: string;
  title: string;
  Icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
}[] = [
  {
    path: "/house",
    title: "House",
    Icon: HouseIcon,
  },
  {
    path: "/market",
    title: "Market",
    Icon: MarketIcon,
  },
  {
    path: "/profile",
    title: "Profile",
    Icon: ProfileIcon,
  },
];

export const Appbar = () => {
  const { pathname } = useLocation();

  const spring = useSpring({
    from: {
      opacity: 0,
      transform: "translateY(100%)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
    config: {
      ...config.slow,
      friction: 48,
      clamp: true,
    },
  });

  return (
    <a.nav
      className={
        "btm-nav z-20 bg-base-100 py-6 fixed bottom-0 rounded-t-2xl w-full"
      }
      style={spring}
    >
      {tabs.map(({ path, Icon, title }) => (
        <Link to={path} key={title}>
          <button
            className={`flex flex-col items-center ${
              pathname === path ? "active tab-active" : ""
            }`}
          >
            <Icon width={32} height={32} />
            {/* <p
              className={`text-sm tracking-wide ${
                pathname === path ? "text-primary" : "text-neutral"
              }`}
            >
              {title}
            </p> */}
          </button>
        </Link>
      ))}
    </a.nav>
  );
};
