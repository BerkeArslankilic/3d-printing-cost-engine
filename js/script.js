let curSym = '$';
        
        function updateCurrency() {
            curSym = document.getElementById('currency-select').value;
            const prefixes = document.querySelectorAll('.currency-sym');
            prefixes.forEach(p => p.innerText = curSym);
            calculate();
        }

        const getVal = id => Math.max(0, parseFloat(document.getElementById(id).value) || 0);
        
        // Format with space for EUR/TRY if preferred, but usually directly attached is fine.
        const formatM = num => curSym + num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        const formatRaw = num => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

        function calculate() {
            // Inputs
            const weight = getVal('weight');
            const spoolPrice = getVal('spool-price');
            const spoolWeight = getVal('spool-weight') || 1;
            const failureRate = getVal('failure-rate') / 100;

            const timeHours = getVal('time-hours');
            const timeMins = getVal('time-mins');
            const totalHours = timeHours + (timeMins / 60);

            const powerWatts = getVal('power-watts');
            const kwhRate = getVal('kwh-rate');

            const laborMins = getVal('labor-mins');
            const laborRate = getVal('labor-rate');
            
            const extraCost = getVal('extra-cost');
            const markupPct = getVal('markup-pct') / 100;
            
            const exchangeRate = getVal('exchange-rate') || 1;

            // Failure Multiplier 
            const failMultiplier = 1 / Math.max(0.01, (1 - failureRate));

            // Core Math
            const costMaterial = (weight / spoolWeight) * spoolPrice * failMultiplier;
            const costPower = (powerWatts / 1000) * totalHours * kwhRate * failMultiplier;
            const costLabor = (laborMins / 60) * laborRate; 
            
            const totalCost = costMaterial + costPower + costLabor + extraCost;
            const retailPrice = totalCost * (1 + markupPct);
            const netProfit = retailPrice - totalCost;

            // DOM Updates - Values
            document.getElementById('out-mat').innerText = formatM(costMaterial);
            document.getElementById('out-pow').innerText = formatM(costPower);
            document.getElementById('out-lab').innerText = formatM(costLabor);
            document.getElementById('out-ext').innerText = formatM(extraCost);
            
            document.getElementById('out-total-cost').innerText = formatM(totalCost);
            document.getElementById('out-retail').innerText = formatM(retailPrice);
            document.getElementById('out-profit').innerText = formatM(netProfit);
            
            // Exchange Math
            document.getElementById('out-conv-cost').innerText = formatRaw(totalCost * exchangeRate);
            document.getElementById('out-conv-price').innerText = formatRaw(retailPrice * exchangeRate);

            // Visual Bar Updates
            if (totalCost > 0) {
                const pMat = (costMaterial / totalCost) * 100;
                const pPow = (costPower / totalCost) * 100;
                const pLab = (costLabor / totalCost) * 100;
                const pExt = (extraCost / totalCost) * 100;

                document.getElementById('bar-mat').style.width = pMat + '%';
                document.getElementById('bar-pow').style.width = pPow + '%';
                document.getElementById('bar-lab').style.width = pLab + '%';
                document.getElementById('bar-ext').style.width = pExt + '%';
                
                document.getElementById('lbl-mat-pct').innerText = Math.round(pMat) + '%';
                document.getElementById('lbl-pow-pct').innerText = Math.round(pPow) + '%';
                document.getElementById('lbl-lab-pct').innerText = Math.round(pLab) + '%';
                document.getElementById('lbl-ext-pct').innerText = Math.round(pExt) + '%';
            } else {
                document.getElementById('bar-mat').style.width = '0%';
                document.getElementById('bar-pow').style.width = '0%';
                document.getElementById('bar-lab').style.width = '0%';
                document.getElementById('bar-ext').style.width = '0%';
                
                document.getElementById('lbl-mat-pct').innerText = '0%';
                document.getElementById('lbl-pow-pct').innerText = '0%';
                document.getElementById('lbl-lab-pct').innerText = '0%';
                document.getElementById('lbl-ext-pct').innerText = '0%';
            }
        }

        // Run once on load
        calculate();