

import { useTenant } from '@/Context/tenantsContext';
import React, { useRef, useState } from 'react';
import { Contract } from './contractType';
import { LabelValue, SectionHeader } from './ReusableContractComponent';
import { CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ContractSignaturesUpload from './ContractSignaturesUpload';
import { DropDown } from '@/Components/DropDownComponent/DropDown';

const ContractTemplate: React.FC<Contract> = (contractInfo) => {
    const { tenant } = useTenant();
    const contractRef = useRef<HTMLDivElement>(null);
    const [isSignatureOpen, setIsSignatureOpen] = useState<boolean>(false);

    const dropDownList = {
        items: contractInfo.signedAt ? ["Download contract", "Print contract"] : ["Download contract", "Print contract", "Sign contract"],
        onClickLink: (index: number) => {
            switch (index) {
                case 0:
                    handleDownload()
                    break;
                case 1:
                    handlePrint()
                    break;
                case 2:
                    //    alert("Sign")
                    setIsSignatureOpen(true)
                    break;
                default:
                    break;
            }
        },
        showCustomButton: true,
    };



    const handlePrint = () => {
        const content = contractRef.current;
        if (!content) return;

        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) return;

        // grab meta, link, and style tags
        const headNodes = Array.from(
            document.head.querySelectorAll('meta[name="viewport"], link[rel="stylesheet"], style')
        ).map(n => n.outerHTML).join('\n');

        printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Contract</title>
        ${headNodes}
        <style>
          /* 1) tell the browser: we're actually printing A4 */
          @page { size: A4 portrait; margin: 0; }

          /* 2) override any "screen-based" widths & tailwind max-widths */
          @media print {
            html, body {
              width: 210mm !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* your wrapper: force full-page, no max-width */
            .page {
              width: 210mm !important;
              min-height: 297mm !important;
              box-sizing: border-box !important;
              padding: 20mm !important;
              max-width: none !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
            }
          }

          /* 3) screen preview styling (optional) */
          .page {
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
            padding: 20mm;
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${content.innerHTML}
        </div>
      </body>
    </html>
  `);

        printWindow.document.close();
        printWindow.focus();

        // give CSS a moment to load
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };



    const handleDownload = async () => {
        if (!contractRef.current) return;

        try {
            const canvas = await html2canvas(contractRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                scrollY: -window.scrollY
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${tenant?.companyName}_Contract_${contractInfo.id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <div className="w-full p-4 antialiased text-textDarkGrey">
            {/* Floating action buttons */}

            <div className="flex w-fit justify-end ml-auto p-2 ">
                <DropDown {...dropDownList} />
            </div>

            {/* Contract content */}
            <div
                ref={contractRef}
                // className="w-full mx-auto bg-white p-[16px_16px_0px_16px] text-sm border-[0.6px] border-strokeGreyThree rounded-[20px] text-[1.15rem] leading-relaxed"
                className="w-full mx-auto bg-white  text-base leading-relaxed p-2"
            >
                {/* Header */}
                <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl border border-[#E0E0E0] p-4">
                    <div className="flex items-center gap-3">
                        {tenant?.logoUrl && (
                            <img
                                src={tenant.logoUrl}
                                alt="Company Logo"
                                className="w-12 h-12 rounded-full object-cover border-[0.6px] border-strokeGreyThree"
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-textDarkGrey uppercase tracking-tight">
                                {tenant?.companyName || "Company Name"}
                            </h2>
                            <p className="text-xs text-textDarkGrey">
                                {tenant?.email || "company@example.com"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <p className="text-xs font-light text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                            Contract ID:{" "}
                            <span className="uppercase font-semibold font-mono">
                                {contractInfo.id || "N/A"}
                            </span>
                        </p>
                        <p className="text-xs font-light text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                            Date:{" "}
                            <span className="font-medium">
                                {contractInfo.createdAt ?
                                    new Date(contractInfo.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }) :
                                    "N/A"}
                            </span>
                        </p>
                    </div>
                </section>

                {/* Main title */}
                <div className="text-center my-6">
                    <p className="text-sm text-textDarkGrey">
                        This AGREEMENT is made between
                        <span className="uppercase font-semibold mx-1">
                            {tenant?.companyName || "Company"}
                        </span>
                        and
                        <span className="uppercase font-semibold mx-1">
                            {contractInfo.fullNameAsOnID}
                        </span>
                    </p>
                </div>

                {/* <hr className="my-4 border-t-[0.2px] border-[#E0E0E0]" /> */}

                {/* Two-column details section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Company details */}
                    <div className="border border-strokeGreyThree p-4 rounded-3xl">
                        <SectionHeader>COMPANY DETAILS</SectionHeader>
                        {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                        <div className="space-y-2">
                            <LabelValue
                                label="Company"
                                value={tenant?.companyName}
                                valueClassName="uppercase text-xs text-textDarkGrey font-semibold"
                            />
                            <LabelValue
                                label="Address"
                                value={tenant?.address}
                                valueClassName="text-xs text-textDarkGrey"
                            />
                            <LabelValue
                                label="Phone"
                                value={tenant?.phone}
                                valueClassName='text-xs text-textDarkGrey font-mono'
                            />
                            <LabelValue
                                label="Email"
                                value={tenant?.email}
                                valueClassName="text-xs text-textDarkGrey"
                            />
                        </div>
                    </div>

                    {/* Customer details */}
                    <div className="border border-strokeGreyThree p-4 rounded-3xl">
                        <SectionHeader>CUSTOMER DETAILS</SectionHeader>
                        {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                        <div className="space-y-2">
                            <LabelValue
                                label="Name"
                                value={contractInfo.fullNameAsOnID}
                                valueClassName="text-xs text-textDarkGrey font-semibold"
                            />
                            <LabelValue
                                label="Phone"
                                value={contractInfo.sale[0]?.customer?.phone}
                                valueClassName='text-xs text-textDarkGrey font-mono'
                            />
                            <LabelValue
                                label="Email"
                                value={contractInfo.sale[0]?.customer?.email}
                                valueClassName="text-xs text-textDarkGrey"
                            />
                            <LabelValue
                                label={contractInfo?.idType || "ID Type"}
                                value={contractInfo?.idNumber}
                                labelClassName="uppercase text-xs text-textDarkGrey font-semibold"
                                valueClassName='text-xs text-textDarkGrey font-mono'
                            />
                        </div>
                    </div>
                </div>

                {/* Installation address */}
                <div className="mb-6">
                    <SectionHeader>INSTALLATION ADDRESS</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <div className="bg-[#F6F8FA] p-4 rounded-3xl border border-strokeGreyThree">
                        <p className="text-xs text-textDarkGrey font-medium">
                            {contractInfo.addressAsOnID || "Not specified"}
                        </p>
                    </div>
                </div>

                {/* Product specification */}
                <div className="mb-6">
                    <SectionHeader>1. PRODUCT SPECIFICATION</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <p className="mb-4 text-xs text-textDarkGrey">
                        <span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span>
                        will sell to the Customer and the Customer agrees to buy from {tenant?.companyName} the following products:
                    </p>

                    <div className="w-full p-[16px_16px_0px_16px] border border-strokeGreyThree rounded-3xl overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="h-[32px]">
                                    <th className="p-2 text-xs font-light text-left text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></span>
                                            <span>Product</span>
                                        </div>
                                    </th>
                                    <th className="p-2 text-xs font-light text-left text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></span>
                                            <span>Component(s)</span>
                                        </div>
                                    </th>
                                    <th className="p-2 text-xs font-light text-left text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></span>
                                            <span>Quantity</span>
                                        </div>
                                    </th>
                                    <th className="p-2 text-xs font-light text-left text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></span>
                                            <span>Warranty</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {contractInfo.sale?.flatMap((sale, saleIndex) =>
                                    sale.saleItems?.map((item, itemIndex) => (
                                        <tr key={`${saleIndex}-${itemIndex}`} className="h-[40px] hover:opacity-80">
                                            <td className="px-2 text-xs text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                                <span>{item.product?.name || "N/A"}</span>
                                            </td>
                                            <td className="px-2 text-xs text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                                {item.product.inventories.length > 0 ? (
                                                    <ul className="space-y-1">
                                                        {item.product.inventories.map((inv) => (
                                                            <li key={inv.id} className="text-xs text-textDarkGrey flex items-center gap-2">
                                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                                                {inv.inventory.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-textDarkGrey">—</span>
                                                )}
                                            </td>
                                            <td className="px-2 text-xs text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                                <span>{item.quantity}</span>
                                            </td>
                                            <td className="px-2 text-xs text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]">
                                                <span>N/A</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Purchase price & payment plans */}
                <div className="mb-6">
                    <SectionHeader>2. PURCHASE PRICE & PAYMENT PLANS</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <div className="border border-strokeGreyThree p-4 rounded-3xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-textDarkGrey font-semibold">Payment Plan:</span>
                            <span className="text-xs text-textDarkGrey font-bold">4 Months</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-textDarkGrey">
                                The Customer shall pay the purchase price for the Product, based on pricing and payment plans made available by
                                <span className='uppercase font-bold mr-1'>
                                    {tenant?.companyName}
                                </span> at the time of signing this Agreement.
                            </p>
                            <p className="text-xs text-textDarkGrey">
                                <span className="font-semibold">Payment Schedule:</span> The initial deposit shall be payable upon signing this Agreement.
                                Subsequent installments shall become payable monthly until the purchase price is fully discharged.
                            </p>
                            <p className="bg-[#FFF8E6] p-3 rounded-[20px] border-[0.6px] border-[#FFEECC] text-xs text-textDarkGrey">
                                <span className="font-semibold">Important:</span> All payments regarding this Contract/Agreement shall be made to
                                <span className='uppercase font-bold mr-1'>
                                    {tenant?.companyName}
                                </span> Account. Take NOTE that no payment is to be made either via cash or bank transfer into sales Agent account.
                                <span className='uppercase font-bold mr-1'>
                                    {tenant?.companyName}
                                </span> shall not be liable for such payments.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Title section */}
                <div className="mb-6">
                    <SectionHeader>3. TITLE</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <p className="border border-strokeGreyThree p-4 rounded-3xl text-xs text-textDarkGrey">
                        <span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span>
                        shall retain ownership, title and all interest to the Product and until full payment of the Purchase Price is received from
                        Customer in accordance with the terms of this Agreement.
                    </p>
                </div>

                {/* Liens & Encumbrances */}
                <div className="mb-6">
                    <SectionHeader>4. LIENS & ENCUMBRANCES</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <p className="border border-strokeGreyThree p-4 rounded-3xl text-xs text-textDarkGrey">
                        Customer shall safely keep the Product free from any liens and encumbrances at the Installation Location. Customer shall not
                        remove the Product from the Installation Location before the completion of payment of the Purchase Price without
                        <span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span>'s prior written consent.
                    </p>
                </div>

                {/* Installation */}
                <div className="mb-6">
                    <SectionHeader>5. INSTALLATION</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <p className="border border-strokeGreyThree p-4 rounded-3xl text-xs text-textDarkGrey">
                        Customer may not install the Product or engage the services of an Installer to install the Product at the Installation Location.
                        <span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span> reserves the responsibility for the installation of the System by the Customer or an Installer. Customer is solely liable.
                    </p>
                </div>

                {/* Product Warranty */}
                <div className="mb-6">
                    <SectionHeader>6. PRODUCT WARRANTY</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <div className="border border-strokeGreyThree p-4 rounded-3xl space-y-2">
                        <p className="text-xs text-textDarkGrey">
                            The Product comes with a <span className="font-bold">3-year warranty</span> which shall be activated from the date of signing this Agreement and covers only a
                            functional malfunction of the Product, not warrants the Customer from using the Product, subject to normal wear and tear. Validity
                            of the product warranty is however subject to Customer's compliance with the following terms:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 text-xs text-textDarkGrey">
                            <li>Before completion of payment of the Purchase Price, Customer shall not sell, transfer or lease the Product to a third party.</li>
                            <li>Customer shall promptly report a case of technical malfunction to <span className='uppercase font-bold mr-1'>
                                {tenant?.companyName}
                            </span> by calling the customer experience helpline; and</li>
                            <li>Customer shall not open, repair or tamper with the Product or cause a third party to open, repair or tamper with the Product.</li>
                        </ul>
                        <p className="text-xs text-textDarkGrey">
                            Customer shall not be entitled to claim on the product warranty where it is discovered that the Product has been damaged by
                            Customer or while in Customer's possession and Customer agrees to pay the cost for the repair of the damage to the System or
                            replacement of the Product.
                        </p>
                    </div>
                </div>

                {/* Default & Conditional Refund */}
                <div className="mb-6">
                    <SectionHeader>7. DEFAULT & CONDITIONAL REFUND</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <p className="bg-[#FFEBEE] p-4 rounded-3xl border border-[#FFCDD2] text-xs text-textDarkGrey">
                        This agreement may be terminated by <span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span> with or without prior notice to the customer if the customer fails, neglects, or is unable
                        to make payment for more than (7)seven (7) consecutive days from any due date in which case,<span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span> shall disconnect, recover or
                        take back the <span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span> item and the customer shall forfeit any payment made hitherto and shall compensate <span className='uppercase font-bold mr-1'>
                            {tenant?.companyName}
                        </span> according to the
                        market price for any damaged or missing parts, accessories and/or components.
                    </p>
                </div>

                {/* Next of Kin Details */}
                <div className="mb-6">
                    <SectionHeader>8. NEXT OF KIN DETAILS</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border border-strokeGreyThree p-4 rounded-3xl text-xs text-textDarkGrey">
                        <div>
                            <span className="font-semibold">Name:</span> {contractInfo.nextOfKinFullName || "Not provided"}
                        </div>
                        <div>
                            <span className="font-semibold">Address:</span> {contractInfo.nextOfKinHomeAddress || "Not provided"}
                        </div>
                        <div>
                            <span className="font-semibold">Phone:</span> {contractInfo.nextOfKinPhoneNumber || "Not provided"}
                        </div>
                    </div>
                </div>

                {/* Guarantor Details */}
                <div className="mb-6">
                    <SectionHeader>9. GUARANTOR DETAILS</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-strokeGreyThree p-4 rounded-3xl text-xs text-textDarkGrey">
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Guarantor's Name:</span> {contractInfo.guarantorFullName || "Not provided"}
                            </div>
                            <div>
                                <span className="font-semibold">Address:</span> {contractInfo.guarantorHomeAddress || "Not provided"}
                            </div>
                            <div>
                                <span className="font-semibold uppercase">{contractInfo.guarantorIdType || "ID Type"}:</span> {contractInfo.guarantorIdNumber || "Not provided"}
                            </div>
                            <div>
                                <span className="font-semibold uppercase">Email:</span> {contractInfo.guarantorEmail || "Not provided"}
                            </div>
                        </div>
                        <div>
                            <div className="mb-2">
                                <span className="font-semibold">Guarantor's Signature:</span>
                            </div>
                            <div className="border border-dashed border-strokeGreyThree h-24 w-full mb-2 flex items-center justify-center text-textDarkGrey">
                                {contractInfo.signatures?.guarantor ? (
                                    <img
                                        src={contractInfo.signatures?.guarantor}
                                        alt="Guarantor Signature"
                                        className="h-full object-contain"
                                    />
                                ) : "Signature"}
                            </div>
                            <div className="text-xs text-textDarkGrey">
                                Date: {contractInfo.signedAt ?
                                    new Date(contractInfo.signedAt).toLocaleDateString() :
                                    "_______________"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contract Timeline */}
                <div className="mb-6">
                    <SectionHeader>10. CONTRACT TIMELINE</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-strokeGreyThree p-4 rounded-3xl text-xs text-textDarkGrey">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <div>
                                <span className="font-semibold">Commencement Date:</span>{" "}
                                {contractInfo.createdAt ?
                                    new Date(contractInfo.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }) :
                                    "N/A"}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <div>
                                <span className="font-semibold">Date of Collection:</span>{" "}
                                {contractInfo.createdAt ?
                                    new Date(contractInfo.createdAt).toLocaleDateString() :
                                    "To be determined"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Acknowledgment & Signature */}
                <div className="mb-6">
                    <SectionHeader>11. CUSTOMER ACKNOWLEDGMENT & SIGNATURE</SectionHeader>
                    {/* <hr className="my-2 border-[0.2px] border-[#E0E0E0]" /> */}
                    <div className="border border-strokeGreyThree p-4 rounded-3xl text-xs text-textDarkGrey">
                        <p>
                            I, <span className="font-bold">{contractInfo.fullNameAsOnID || "Customer Name"}</span>, hereby acknowledge that I have read, understood, and agree to all the terms and conditions outlined in
                            this agreement. I confirm that all information provided is accurate and complete.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                            <div className="mb-2 text-xs text-textDarkGrey font-semibold">Customer's Signature:</div>
                            <div className="border-[0.6px] border-dashed border-strokeGreyThree h-24 w-full mb-2 flex items-center justify-center text-textDarkGrey">
                                {contractInfo.signatures?.owner ? (
                                    <img
                                        src={contractInfo.signatures?.owner}
                                        alt="Customer Signature"
                                        className="h-full object-contain"
                                    />
                                ) : "Signature"}
                            </div>
                            <div className="text-xs text-textDarkGrey">
                                Date: {contractInfo.signedAt ?
                                    new Date(contractInfo.signedAt).toLocaleDateString() :
                                    "_______________"}
                            </div>
                        </div>
                        <div className="space-y-2 text-xs text-textDarkGrey">
                            <div>
                                <span className="font-semibold">Customer Name:</span> {contractInfo.fullNameAsOnID || "Not provided"}
                            </div>
                            <div>
                                <span className="font-semibold">Phone Number:</span> {contractInfo.sale[0]?.customer?.phone || "Not provided"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms acceptance box */}
                <div className="border border-strokeGreyThree rounded-3xl p-4 text-center mb-6 bg-[#F6F8FA]">
                    <h4 className="font-bold text-sm text-textDarkGrey mb-2">CUSTOMER HEREBY ACCEPTS THE ABOVE TERMS AND CONDITIONS</h4>
                    <p className="text-xs text-textDarkGrey">This agreement is governed by the laws of the Federal Republic of Nigeria</p>
                </div>

                {/* Footer sections */}
                <div className="space-y-4 text-xs text-textDarkGrey mb-10">
                    <div>
                        <h4 className="font-bold text-blue-600 mb-1">12. DATA PROTECTION</h4>
                        <p>
                            {tenant?.companyName}, in accordance with applicable data protection laws, shall treat personal data as recovered and applying the Agreement and is subject to the relevant data protection laws of Nigeria, Customer
                            hereby agrees and accepts {tenant?.companyName}'s Privacy Policy published on its website and as may be amended from time to time.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-blue-600 mb-1">13. ENTIRE AGREEMENT</h4>
                        <p>
                            This Product is entirely at the risk of the Customer from the moment the Customer takes possession of the Product even when title has not passed to
                            the Customer. The Customer shall be wholly responsible for payment of the Product or for its outstanding value as and when due for the Product in the event of loss and/or damage.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-blue-600 mb-1">14. GOVERNING LAW</h4>
                        <p>
                            This Agreement shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any and all disputes arising
                            hereunder shall be resolved by a competent court having jurisdiction over such matters in the Federal Republic of Nigeria.
                        </p>
                    </div>
                </div>
            </div>
            {!contractInfo.signedAt && !contractInfo?.signatures?.owner &&
                (<ContractSignaturesUpload
                    isOpen={isSignatureOpen}
                    setIsOpen={setIsSignatureOpen}
                    contractId={contractInfo.id}
                    contractRefresh={contractInfo.refresh}
                // onSuccess={contractInfo.refresh}
                />)
            }
        </div>
    );
};

export default ContractTemplate;
