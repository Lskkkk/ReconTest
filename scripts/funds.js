//   let funds = [
//     { name: "szzs", id: "470007", bestStrategy: "" },
//     { name: "hldb", id: "005562" },
//     { name: "dpqh", id: "007937" },
//     { name: "300", id: "110020" },
//     { name: "zzhl", id: "090010" },
//     { name: "huangj", id: "000217" },
//     { name: "baijiu", id: "161725" },
//     { name: "fgth", id: "161005" },
//     { name: "bp500", id: "050025" },
//     { name: "nsdk", id: "040046" },
//   ];

let funds = {
    ["470007"]: {
        name: "上证综指ETF",
    },
    ["005562"]: {
        name: "红利低波ETF",
    },
    ["007937"]: {
        name: "豆粕期货ETF",
    },
    ["110020"]: {
        name: "沪深300ETF",
    },
    ["000217"]: {
        name: "黄金ETF",
    },
    ["050025"]: {
        name: "标普500ETF",
    },
};

const readFunds = async () => {
    let cache = await getGuiCache();
    if (cache) {
        cache = JSON.parse(cache);
        if (cache["funds"]) {
            Object.keys(cache["funds"]).forEach((cf) => {
                funds[cf] = {
                    ...cache["funds"][cf],
                    ...funds[cf]
                };
            });
        }
    }
    let extraOptions = await getFundExtraOptions();
    if (extraOptions) {
        extraOptions = JSON.parse(extraOptions);
        extraOptions.forEach(op => {
            if (!funds[op]) {
                funds[op] = {
                    name: op
                };
            }
        });
    };
    console.log('finish readFunds');
}
const saveFunds = () => {
    setGuiCache(
        JSON.stringify({
            funds,
        })
    );
};

const getGuiCache = async () => {
    return fetch("http://localhost:3000/getGuiCache")
        .then((response) => response.text())
        .then((data) => {
            return data;
        });
};
const setGuiCache = async (data) => {
    if (!!data) {
        return fetch(`http://localhost:3000/setGuiCache?data=${data}`)
            .then((response) => response.text())
            .then((data) => {
                return data;
            });
    }
    return Promise.reject();
};
const getFundExtraOptions = async () => {
    return fetch("http://localhost:3000/getFundExtraOptions")
        .then((response) => response.text())
        .then((data) => {
            return data;
        });
};

(async () => {
    await readFunds();
})();