import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { checkLoginStatus, getIpData, parseLocation, type IPData } from "./utils/api";
import { Loader } from "./component/loader";
import "./homepage.css";
import { GoogleMaps } from "./component/map";
import { toast } from "react-toastify";
import { isPublicIPv4 } from "./utils/ipv4";

export function HomepageWrapper() {
  const navigate = useNavigate();
  const [isLoadingLoginStatus, setIsLoadingLoginStatus] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await checkLoginStatus();
      setIsLoadingLoginStatus(false);
      if (!status) navigate("/login");
    })();
  }, []);

  if (isLoadingLoginStatus)
    return (
      <div className="loader-page">
        <Loader />
      </div>
    );

  return <Homepage />;
}

const goToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const useHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selected, _setSelected] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [entries, setEntries] = useState<IPData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const setSelected = (ip: string) => {
    goToTop();
    _setSelected(ip);
  };

  // Load the user's IP data location
  useEffect(() => {
    (async () => {
      try {
        const data = await getIpData();
        setEntries([data]);
        setSelected(data.ip);
        setIsLoading(false);
      } catch (err) {
        toast.error("Failed to load the user's data");
        console.log(err);
      }
    })();
  }, []);

  async function search() {
    const status = isPublicIPv4(searchTerm);
    if (!status.validity) {
      return toast.error("Invalid IP Address: " + status.reason);
    }

    const existing = entries.findIndex((ip) => ip.ip === searchTerm);
    if (existing !== -1) {
      setSelected(searchTerm);
      setSearchTerm("");
      return;
    }

    try {
      setIsLoading(true);

      // Load the new data and clear search box
      const data = await getIpData(searchTerm);
      setEntries((prev) => [...prev, data]);
      setSelected(data.ip);
      setSearchTerm("");
    } catch (err) {
      console.log("Failed to load data: ", err);
      toast.error("Failed to load details about the IP address.");
    } finally {
      setIsLoading(false);
    }
  }

  async function remove(ip: string) {
    if (ip === entries[0].ip) return;
    if (selected == ip) setSelected(entries[0].ip);

    if (multiSelected.length > 1 && multiSelected.includes(ip)) {
      setEntries(entries.filter((e) => !multiSelected.includes(e.ip)));
      setMultiSelected([]);

      // Default to home IP when the current one is removed through multiselection
      if (multiSelected.includes(selected!)) setSelected(entries[0].ip);
      return;
    }

    if (multiSelected.includes(ip)) {
      setMultiSelected(multiSelected.filter((e) => e != ip));
    }

    setEntries(entries.filter((e) => e.ip != ip));
  }

  function toggle(ip: string) {
    if (multiSelected.includes(ip)) {
      setMultiSelected(multiSelected.filter((e) => e != ip));
    } else {
      setMultiSelected([...multiSelected, ip]);
    }
  }

  const shown = selected != null ? entries.find((e) => e.ip === selected) : null;
  return {
    shown,
    search,
    searchTerm,
    setSearchTerm,
    entries,
    isLoading,
    selected,
    setSelected,
    remove,
    multiSelected,
    toggle,
  };
};

function Homepage() {
  // get the ip address of the user
  const Controller = useHistory();

  return (
    <div className="homepage">
      <h1>Location Tracker</h1>

      {Controller.shown == null ? (
        <p>Loading your location from Google Maps...</p>
      ) : (
        <div className="selected-ip">
          <div className="header">
            <p>
              Selected IP Address is: <code>{Controller.shown.ip}</code>
            </p>
          </div>

          <div className="map-wrapper">
            <GoogleMaps coordinates={parseLocation(Controller.shown.loc)} />
          </div>

          <ul className="details">
            {[
              ["Hostname", Controller.shown.hostname],
              ["City", Controller.shown.city],
              ["Region", Controller.shown.region],
              ["Country", Controller.shown.country],
              ["Latitude", Controller.shown.loc.split(",")[0]],
              ["Longitude", Controller.shown.loc.split(",")[1]],
              ["Organization", Controller.shown.org],
              ["Postal Code", Controller.shown.postal],
              ["Timezone", Controller.shown.timezone],
            ].map(([label, value]) => (
              <li key={label}>
                <b>{label}:</b> {value}
              </li>
            ))}
          </ul>

          {Controller.selected != Controller.entries[0].ip && (
            <div className="actions">
              <button onClick={() => Controller.setSelected(Controller.entries[0].ip)}>Clear Search</button>
            </div>
          )}
        </div>
      )}

      <div className="searchbar_container">
        <h2>Search More Addresses</h2>

        <div className="searchbar">
          <input
            type="text"
            placeholder="Enter a valid public IPv4 address here"
            onChange={(e) => Controller.setSearchTerm(e.target.value)}
            value={Controller.searchTerm}
            disabled={Controller.isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") Controller.search();
            }}
          />

          <button disabled={Controller.isLoading} onClick={() => Controller.search()}>
            Locate!
          </button>
        </div>

        <div className="history">
          {Controller.entries.map((entry, idx) => (
            <div className="search" key={idx}>
              <div className="checkbox_wrap">
                <input
                  disabled={idx == 0}
                  type="checkbox"
                  checked={Controller.multiSelected.includes(entry.ip)}
                  onChange={() => Controller.toggle(entry.ip)}
                />
              </div>
              <div className="info">
                <p className="ip">
                  <code>{entry.ip}</code>
                </p>
                <p className="org">{entry.org}</p>
              </div>

              <div className="actions">
                {idx != 0 && (
                  <button onClick={() => Controller.remove(entry.ip)} className="destructive">
                    Remove
                  </button>
                )}

                <button onClick={() => Controller.setSelected(entry.ip)} disabled={Controller.selected == entry.ip}>
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
