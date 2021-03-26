/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
    /* more to do list
    -Identity/wallet. 
        -recognise individual identity. existing ownership/ age (min 21) / Single?(35) /
        -recognise individual financials. Bank assessment & HLE(HDB).
        -allow for Financial / Regulation eligibility checks.
        -have regulatory/financial profile > as per govt regulation - #of house ownership affect stamp duty. & purchase restrictions.
        -User is a foreigner or local? (foreigners can only buy private properties)
        -who are the occupants?
    -Mortgage Loans
        -User's bank acct Smart Contracts to trigger Esx's estate transactions for estate sales.
        -individual financial assessment via. SC. (fr. Banks, TDSR restriction by Govt.) (fr. HDB, HLE checks)
        -Sc. for Users to repay estate loan after purchase of estate. 
        -Bank Loans (private prop)    
            -mortgage plans available for choosing via. SC. >>> this will lead to final payment for sale completion.
            -bank extract personal information from Govt. with consensus from User. (limit infomation viewable by banks)
            -Banks have a more competitive Interest rate compare to Govt loans. (Rate fluctuates & differs between banks.)
        -HDB Loans (govt. prop)    
            -SC. to pay stampDuties.
            -HDB Concessionary Loan (LTV~90/75% value or selling price)
            -CPF financing.
    -Govt.
        -Buyer/Ownership Assesments. (eg.buying/selling restrictions.) 
            -current property owned. Affects stamp duties payable & affects HDB ownership.
            -Age >35 allow to buy hdb units as individuals.
            -check if existing property MOP has been completed.
        -Checks to ensure estate is available for sale via. SC.(eg. bankruptcy, consensus of multiple owners, etc.)
        -Needs a channel to implement property buying regulations. affecting banks/buyers/sellers. off-chain policy decisions?
        -if User buy a Resale HDB, user need to dispose (all private properties) or existing HDB within 6mths of purchase. 
    -Esx(Asset handling).
        -show buyer's Total Sale Amount =  Face Value + (Stamp duty)
            -Stamp duty calculated base on user's indentity profile. 
            -alot of buyers neglected account for payment of stamp duties and lawyer fees during purchase.
        -how to handle estate valuations? oracles?
        -view asset history. (time Stamp?)
        -before compeletion of Sale both Seller & Buyers need to finish paying stamp duty (S.C is needed to check buyer & Seller stamp duty status.)
        -Most properties has multiple owners (husband & wife), how does esx platform handles it?
        -Stamp duties has expiry dates. > need conditions to check for expiries.
        -need to handle Creation of Asset during construction?(construction of building is a long process, with checks by Govt to ensure compliance.)
        -how to handle demolishing of assets. 
    */

'use strict';

const { Contract } = require('fabric-contract-api');    //code starts with an import of a Contract definition from the fabric-contract-api node module

class EsxContract extends Contract {                    //EsxContract is a Contract

    async baseLedger(ctx) {                             //Populate the blockchain with 3 sample estates below.
        console.info('============= START : Base Ledger ==========='); 
        const estates = [ //estates is an array storing below data.
            {   //hidden estate attributes: estateId, docType.
                //shown estate attributes: builder, buildDate, tenure, postal, unit, buyDate, faceValue, owner, option(toPurchase), forsale.
                builder: 'HDB',
                buildDate: '2020-02-28',
                tenure: '99',
                postal: '678901',
                unit:'12-345',
                buyDate:'2020-03-01',
                faceValue:'400000',
                owner:'AppleBerry',
                option:'complete',
                forSale:'yes',
            },
            {
                builder: 'Red Rock Construction',
                buildDate: '2019-01-01',
                tenure: 'FreeHold',
                postal: '489860',
                unit:'0',
                buyDate:'2019-06-11',
                faceValue:'2000000',
                owner:'CreamDonut',
                option:'complete',
                forSale:'no',
            },
            {
                builder: 'Green Env',
                buildDate: '2018-05-17',
                tenure: '99',
                postal: '847591',
                unit:'07-310',
                buyDate:'2018-06-23',
                faceValue:'500000',
                owner:'EclairFudge',
                option:'complete',
                forSale:'no',
            },
        ];

        for (let i = 0; i < estates.length; i++) {          //giving each estate an incrementing index like Estate1, Estate2, Estate# ...
            estates[i].docType = 'estate';                  //label all the estates# as asset type 'estate'
            await ctx.stub.putState('EID' + i, Buffer.from(JSON.stringify(estates[i])));     // matching EID# with estates'contents, and stored into worldstate.
            console.info('Added <--> ', estates[i]);        //console display
        }
        console.info('============= END : Base Ledger ===========');    
        console.log('Base Ledger has been Generated');                  
    }   

    async queryAllEstates(ctx) {    //Fetch all Data in Ledger
        const startKey = '';        //store startkey
        const endKey = '';          //store endskey
        const allResults = [];      //store allresult value
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) { //extract key/value from Range Start~End
            const strValue = Buffer.from(value).toString('utf8');                      //store Value in utf8 format in strValue (stringvalue)
            let record;                                                                //call for record action
            try {                                                                      //do this    
                record = JSON.parse(strValue);                                         //record stores strValue read in JSON
            } catch (err) {                                                            //call out error.
                console.log(err);                                                      //console display error
                record = strValue;                                                     //record stores strvalue
            }
            allResults.push({ Key: key, Record: record });                             //push value frm Key & Record into allResults.
        }
        console.info(allResults);                                                    
        return JSON.stringify(allResults);                                             //display Results
    }

    async createEstate(ctx, builder, buildDate, tenure, postal, unit, faceValue, option, forSale ) {  //Defining the creation of estate 
        console.info('============= START : Create estate ===========');  
        const estate = {            //creating NewEstate with below data.
            docType: 'estate',      //not shown in creation
            buyDate: 'yyyy-mm-dd',  //not shown in creation
            owner: 'None',          //not shown in creation
            builder,                //arg0   
            buildDate,              //arg1
            tenure,                 //arg2
            postal,                 //arg3
            unit,                   //arg4
            faceValue,              //arg5
            option,                 //arg6
            forSale,                //arg7
            //estateId,             //arg8 hidden, because had switch to incrementing index.
        };

        const startKey = '';      //store startkey
        const endKey = '';        //store endskey
        const estates = [];       //estates is an array    
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {  //extract key/value from Range Start~End
            estates.push({Key: key, Value: value})                                      //push value frm "Key & value" into estates (array)
        };
        
        let i = JSON.stringify(estates.length);                                   //Store number of estate in "i"
        const n = i++ ;                                                           //"n" is an incrementing index of "i"
        await ctx.stub.putState('EID' + n, Buffer.from(JSON.stringify(estate)));  //store new value in worldstate.
       
        //await ctx.stub.putState(estateId, Buffer.from(JSON.stringify(estate))); //hidden, using index increment.
        console.info('============= END : Create estate ===========');
        console.log('A New Estate has Been Created');
        return JSON.stringify(estate);              
    }

    async queryEstate(ctx, estateId) {                           // Query a Specific Estate
        const estateAsBytes = await ctx.stub.getState(estateId); // store EstateID(EID#) into estateAsBytes (EAB)
        if (!estateAsBytes || estateAsBytes.length === 0) {      // check (invert)EAB |or| EAB.length(string length) === nothing // will check both, but will use which ever is true.
            throw new Error(`${estateId} does not exist`);       // if above > error msg "ID does not exist"
        }
        console.log(estateAsBytes.toString());                    
        return estateAsBytes.toString();                         
    }

    async placeOption(ctx, estateId, ) {                          //placement of Option to Purchase    
        console.info('============= START : Placing Option ===========');

        const estateAsBytes = await ctx.stub.getState(estateId);  //check for EID existence. 
        if (!estateAsBytes || estateAsBytes.length === 0) {
            throw new Error(`${estateId} does not exist`);
        }

        const estate = JSON.parse(estateAsBytes.toString());      //store EAB string in estate.
        if (estate.forSale == 'no') {                             //check if estate is not for sale.
            throw new Error(`${estateId} is not for sale`);       //error > not for sale.
        }

        if (estate.option == 'placed') {                                                    //check for option 'placed'
            throw new Error(`Option to Purchase for ${estateId} has already been Placed`);   //error > .
        }
        
        estate.option = 'placed';                                 //placed value is applied but not shown.

        await ctx.stub.putState(estateId, Buffer.from(JSON.stringify(estate)));     
        console.info('============= END : Placing Option ===========');             
        console.log('1% Booking Fee has been Placed');                              
        return (`1% Booking Fee has been placed as an Option to Purchase for ${estateId}`); 

    }

    async excerciseOption(ctx, estateId, ) {                      //Exercise option + sign sales and purchase
        console.info('============= START : Excercising Option ===========');

        const estateAsBytes = await ctx.stub.getState(estateId);  
        if (!estateAsBytes || estateAsBytes.length === 0) {
            throw new Error(`${estateId} does not exist`);
        }

        const estate = JSON.parse(estateAsBytes.toString());                                    
        if (estate.option == 'exercised') {                                                     //check for option 'exercised'
            throw new Error(`Option to Purchase for ${estateId} has already been Exercised`);   //error > .
        }

        if (estate.option == 'placed') {                        //check if EID's option is placed.        
            estate.option = 'exercised';                        //exercised value is applied but not shown.
        }
        else {
            throw new Error(`Unable to Exercise Option to Purchase for ${estateId}`); 
        }

        await ctx.stub.putState(estateId, Buffer.from(JSON.stringify(estate)));     
        console.info('============= END : Excercising Option ===========');         
        return (`4% Exercise Fee has been paid for the Sales & Purchase of ${estateId}`); 

    }
    
    async stampDuty(ctx, estateId, ) {                              //StampDuty for Govt Endorsement
        console.info('============= START : Checking for Stamp Duty ===========');

        const estateAsBytes = await ctx.stub.getState(estateId);    
        if (!estateAsBytes || estateAsBytes.length === 0) {
        throw new Error(`${estateId} does not exist`);
        }

        const estate = JSON.parse(estateAsBytes.toString());                      
        if (estate.option == 'stamped') {                                         //check for option 'stamped'
            throw new Error(`Stamp Duty of ${estateId} has already been Paid`);   //error > .
        }
        
        if (estate.option == 'exercised') {                         //check if EID's option is exercised.   
            estate.option = 'stamped';                              //Stamped value is applied but not shown.
        }
        else {
            throw new Error(`Unable to pay Stamp Duty for ${estateId}`);    
        }
        

        await ctx.stub.putState(estateId, Buffer.from(JSON.stringify(estate)));     
        console.info('============= END : Checking for Stamp Duty ===========');    
        console.log('Stamp Duty has been Paid');                                    
        return (`Stamp Duty for ${estateId} has been Paid`);                        
    }

    async changeOwnerCompleteSale(ctx, estateId, newOwner) {        //complete sales + owner change.
        console.info('============= START : Changing Ownership & Compelete Sale ===========');

        const estateAsBytes = await ctx.stub.getState(estateId);    
        if (!estateAsBytes || estateAsBytes.length === 0) {         
            throw new Error(`${estateId} does not exist`);
        }

        const estate = JSON.parse(estateAsBytes.toString());        //store EAB string in estate.
        if (estate.option == 'complete') {                                         //check for option 'complete'
            throw new Error(`Sale of ${estateId} has already been Completed`);     //error > .
        }

        if (estate.option == 'stamped') {                           //check if EID's option is Stamped. 
            estate.option = 'complete';                             //complete value is applied but not shown.
            estate.forSale = 'no';                                  //forSale value is applied as 'no' but not shown. 
        }
        else {
            throw new Error(`Purchase for ${estateId} cannot be completed`); 
        }

        let today = new Date();                                   //indicating today's format
        let dd = today.getDate();                                 //map dd
        let mm = today.getMonth()+1;                              //map mm
        const yyyy = today.getFullYear();                         //map yyyy
        
        if(dd<10)                                                   
        {
        dd=`0${dd}`;                                               //make sure day is in dd format
        } 

        if(mm<10) 
        {
        mm=`0${mm}`;                                                //make sure day is in mm format
        } 
        today = `${yyyy}-${mm}-${dd}`;                              //current Date in y-m-d format

        estate.buyDate = today;                                     //use current date applies not shown.
        estate.owner = newOwner;                                    //New Owner's name can be entered as'arg1'

        await ctx.stub.putState(estateId, Buffer.from(JSON.stringify(estate)));     
        console.info('============= END : Changing Ownership & Compelete Sale ===========');    
        console.log('You have Completed the Purchase');                             
        return (`Congratulations you have finalise the purchase for ${estateId}`);  

    }
    
    async enableSale(ctx, estateId, newfaceValue ) {               //Owner Enable the Sale of Estate
        console.info('============= START : Enabling Sale ===========');

        const estateAsBytes = await ctx.stub.getState(estateId);    
        if (!estateAsBytes || estateAsBytes.length === 0) {
            throw new Error(`${estateId} does not exist`);
        }
        
        const estate = JSON.parse(estateAsBytes.toString());        
        if (estate.forSale == 'yes') {                              //check if forSale is available for sale.
            throw new Error(`${estateId} is already for sale`);     //if yes error > already for sale.
        }
        
        estate.forSale = 'yes';                                     //forSale value is applied as 'yes' but not shown.
        estate.faceValue = newfaceValue;                            //set new faceValue as 'arg1'

        await ctx.stub.putState(estateId, Buffer.from(JSON.stringify(estate)));     
        console.info('============= END : Enabling Sale ===========');              
        console.log('Your Estate is Ready for Sale');                               
        return (`The Estate ${estateId} is Ready for Sale` );                       

    }

    async demolishEstate(ctx, estateId) {                           //WIP need to Add Demolition attributes (demoCoName, demoDate, demoApproval)
        const estateAsBytes = await ctx.stub.getState(estateId); 
        if (!estateAsBytes || estateAsBytes.length === 0) {
            throw new Error(`${estateId} does not exist`);
        }
        await ctx.stub.deleteState(estateId);                       //deleteState ~ delete EstateId
        return (`${estateId} has been Demolished`) 

    }

    /*async countEstates (ctx){       //Check number of Estates in ledger.
        const startKey = '';        //store startkey
        const endKey = '';          //store endskey
        const estates = [];         //estates is an array  
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {  //extract key/value from Range Start~End
            estates.push({Key: key, Value: value});                                     //push value frm "Key & value" into estates (array)
        }
        return JSON.stringify(estates.length)                                           //display number of Estates in Ledger
    }*/

}

module.exports = EsxContract;  //ends EsxContract & export contract.
 