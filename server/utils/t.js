

const reconT = (valueList) => {
    let startMoney = 10000, field = 0, currentValue = 1;
    let firstValue = 0, leftMoney = 0;
    valueList.forEach((valueObj, index) => {
        if (!firstValue) {
            firstValue = valueObj.value;
        }
        currentValue = Number((valueObj.value / firstValue).toFixed(2));
        console.log('from:', field, '*', currentValue, '=', field * currentValue, '+', leftMoney);
        if (!field) {
            // first buy
            field = Math.floor(startMoney / currentValue);
        } else {
            // has field
            if (currentValue * field / startMoney >= 1.1) {
                // sale
                const saleMoney = (currentValue * field - startMoney);
                field -= Math.floor(saleMoney / currentValue);
                leftMoney += saleMoney;
            } else if (currentValue * field / startMoney <= 0.95) {
                // buy
                const buyMoney = (startMoney - currentValue * field);
                // const buyMoney = leftMoney;
                if (leftMoney >= buyMoney && leftMoney > 0) {
                    field += Math.floor(buyMoney / currentValue);
                    leftMoney -= buyMoney;
                }
            }
        }
        console.log('->to:', field, '*', currentValue, '=', field * currentValue, '+', leftMoney);
        console.log('-------------------------------------------------------------');
    });
    console.log('end:', field, '*', currentValue, '=', field * currentValue + leftMoney, 'rate:', (field * currentValue + leftMoney) / startMoney - 1);
    console.log('original:', valueList[valueList.length - 1].value / firstValue * startMoney, (valueList[valueList.length - 1].value / firstValue * startMoney) / startMoney - 1);
};

// reconT(valueChangeListDemo);

let testValueList = [];

// single raise
for (let p = 3000; p <= 4500; p += 100) {
    testValueList.push({
        value: p,
        date: '1'
    });
}
// reconT(testValueList);
// 单边上涨，3000-6000，不做T收益率 100%，减浮盈收益率 72%
// 单边上涨，3000-4500，不做T收益率 50%，减浮盈收益率 42%

// wave
testValueList = [];
for (let p = 3000; p <= 6400; p += p % 200 != 0 ? -300 : 500) {
    testValueList.push({
        value: p,
        date: '1'
    });
}
console.log(testValueList);
reconT(testValueList);
// 震荡行情，3000-6000，不做T收益率 100%，做T收益率 187%
// 震荡行情，3000-4600，不做T收益率 53%，做T收益率 85%