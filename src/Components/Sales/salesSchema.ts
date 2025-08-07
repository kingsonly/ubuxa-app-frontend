import { z } from "zod";

export const identificationDetailsSchema = z
  .object({
    idType: z.string().trim().min(2, "ID Type is required"),
    idNumber: z.string().trim().min(5, "ID Number is required"),
    customerCountry: z.string().trim().min(2, "customer Country is required"),
    customerState: z.string().trim().min(2, "customer State is required"),
    customerLGA: z.string().trim().min(2, "Customer LGA is required").optional(),
    customerIdImage: z
      .instanceof(File)
      // ← now type is File | null
      .refine((f) => f !== null, {
        message: "Please upload your ID image",
      })
      .refine(
        (file) =>
          ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
            file.type
          ),
        {
          message: "Only PNG, JPEG, JPG, or SVG files are allowed.",
        }
      ),
    expirationDate: z
      .string()
      .trim()
      .nonempty({ message: "Expiration date is required" })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid expiration date",
      })
      .refine((date) => new Date(date) > new Date(), {
        message: "Expiration date must be in the future",
      }),
    installationAddress: z.string().trim(),
    installationAddressLongitude: z.string().trim(),
    installationAddressLatitude: z.string().trim(),
  })


export const nextOfKinDetailsSchema = z.object({
  fullName: z.string().trim(),
  phoneNumber: z.string().trim(),
});

export const guarantorDetailsSchema = z.object({
  fullName: z.string().trim().min(3, "Full name is required"),
  phoneNumber: z.string().trim().min(10, "Phone number is required"),
  email: z.string().trim().email("Invalid email").or(z.literal("")),
  homeAddress: z.string().trim().min(1, "Home address is required"),
});

const parametersSchema = z
  .object({
    paymentMode: z.string({
      required_error: "Payment mode is required",
    }).optional(),              // make optional so refine can catch "all empty"
    repaymentStyle: z.string({
      required_error: "Repayment style is required",
    }).optional(),              // make optional so refine can catch "all empty"
    contractType: z.string({
      required_error: "contractType style is required",
    }).optional(),              // make optional so refine can catch "all empty"
    salesMode: z.string({
      required_error: "sales mode is required",
    }).optional(),              // make optional so refine can catch "all empty"
    discount: z.number().min(0, "Discount must be non-negative").optional(),
    discountType: z.boolean().optional(),
    installmentDuration: z.number().optional(),
    installmentStartingPrice: z.number().optional(),
    installmentStartingPriceType: z.boolean().optional(),
  })
  // if *every* field is undefined/null, fire one top-level error
  .refine((p) => {
    return Object.values(p).some((v) => v !== undefined && v !== null);
  }, {
    path: ["parameters"],
    message: "Parameters are required",
  })
  .superRefine((p, ctx) => {
    if (p.salesMode === "INSTALLMENT") {
      if (p.installmentDuration == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parameters", "installmentDuration"],
          message: "Installment duration is required for installment plans",
        });
      }
      if (p.installmentStartingPrice == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parameters", "installmentStartingPrice"],
          message:
            "Installment starting price is required for installment plans",
        });
      }
      if (p.installmentStartingPriceType === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parameters", "installmentStartingPriceType"],
          message:
            "You must pick a price type for installment starting price",
        });
      }
    }
  });

export const saleItemSchema = z
  .object({
    productId: z.string().trim().min(10, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    devices: z.array(z.string()).min(1, "At least one device is required"),
    miscellaneousPrices: z
      .record(z.string(), z.number().min(0, "Price must be a positive number"))
      .optional(),
    parameters: parametersSchema
  })
  .superRefine((data, ctx) => {
    // Conditional validation: If payment mode is INSTALLMENT, ensure related fields are filled
    if (data.parameters.paymentMode === "INSTALLMENT") {
      if (!data.parameters.installmentDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Installment duration is required for installment payments",
          path: ["installmentDuration"],
        });
      }
      if (!data.parameters.installmentStartingPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Installment starting price is required for installment payments",
          path: ["installmentStartingPrice"],
        });
      }
    }
  });

export const formSchema = z
  .object({
    category: z.enum(["PRODUCT"], {
      message: "Category is required",
    }),
    customerId: z.string().min(1, "Please select at least one customer"),
    saleItems: saleItemSchema,
    identificationDetails: identificationDetailsSchema.optional(),
    nextOfKinDetails: nextOfKinDetailsSchema.optional(),
    guarantorDetails: guarantorDetailsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Check if any sale item has paymentMode as "INSTALLMENT"
    const hasInstallment = data.saleItems.parameters.salesMode === "INSTALLMENT" || data.saleItems.parameters.salesMode === "EAAS";

    // If any sale item has paymentMode as "INSTALLMENT", enforce identificationDetails, nextOfKinDetails and guarantorDetails
    if (hasInstallment) {
      // Validate identificationDetails
      if (!data.identificationDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Identification details are required for installment payments",
          path: ["identificationDetails"],
        });
      } else {
        // Validate the nested schema for identificationDetails
        const identificationValidation = identificationDetailsSchema.safeParse(
          data.identificationDetails
        );
        if (!identificationValidation.success) {
          identificationValidation.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["identificationDetails", ...issue.path],
            });
          });
        }
      }

      // Validate nextOfKinDetails
      // if (!data.nextOfKinDetails) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message: "Next of kin details are required for installment payments",
      //     path: ["nextOfKinDetails"],
      //   });
      // } else {
      //   // Validate the nested schema for nextOfKinDetails
      //   const nextOfKinValidation = nextOfKinDetailsSchema.safeParse(
      //     data.nextOfKinDetails
      //   );
      //   if (!nextOfKinValidation.success) {
      //     nextOfKinValidation.error.issues.forEach((issue) => {
      //       ctx.addIssue({
      //         ...issue,
      //         path: ["nextOfKinDetails", ...issue.path],
      //       });
      //     });
      //   }
      // }

      // Validate guarantorDetails
      if (!data.guarantorDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Guarantor details are required for installment payments",
          path: ["guarantorDetails"],
        });
      } else {
        // Validate the nested schema for guarantorDetails
        const guarantorValidation = guarantorDetailsSchema.safeParse(
          data.guarantorDetails
        );
        if (!guarantorValidation.success) {
          guarantorValidation.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["guarantorDetails", ...issue.path],
            });
          });
        }
      }
    }
  });

export type SaleItem = {
  productId: string;
  parameters: {
    paymentMode: string,
    discount?: number,
    discountType: boolean,               // or whichever default you prefer
    installmentDuration?: number,
    installmentStartingPrice?: number,
    installmentStartingPriceType: boolean,
  },
  quantity: number;
  devices: string[];
  miscellaneousPrices?: {
    [key: string]: number;
  };
};

type NextOfKinDetails = {
  fullName: string;
  phoneNumber: string;
};

type IdentificationDetails = {
  idType: string;
  idNumber: string;
  customerCountry: string;
  customerState: string;
  customerLGA?: string;
  expirationDate: string;
  installationAddress: string;
  installationAddressLongitude: string;
  installationAddressLatitude: string;
  customerIdImage: File | null;
};

type GuarantorDetails = {
  fullName: string;
  phoneNumber: string;
  email: string;
  homeAddress: string;
};

export type SalePayload = {
  category: "PRODUCT";
  customerId: string;
  saleItems: any;// SaleItem;
  nextOfKinDetails?: NextOfKinDetails;
  identificationDetails?: IdentificationDetails;
  guarantorDetails?: GuarantorDetails;
};

export const defaultSaleFormData: any = {
  category: "PRODUCT",
  customerId: "",
  saleItems: {
    productId: "",
    quantity: 0,
    devices: [],
    miscellaneousPrices: undefined,
    // use the same shape as saleRecipientSchema default
    parameters: {
      salesMode: "ONE_OFF",
      paymentMode: "CASH",
      discount: 0,
      discountType: true,               // or whichever default you prefer
      installmentDuration: undefined,
      installmentStartingPrice: undefined,
      installmentStartingPriceType: undefined,
      repaymentStyle: undefined,
      contractType: undefined,
    },
  },
  nextOfKinDetails: {
    fullName: "",
    phoneNumber: "",
  },
  identificationDetails: {
    idType: "",
    idNumber: "",
    customerCountry: "",
    customerState: "",
    customerLGA: "",
    expirationDate: "",
    installationAddress: "",
    installationAddressLongitude: "",
    installationAddressLatitude: "",
    customerIdImage: new File([], ''),
  },
  guarantorDetails: {
    fullName: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
  },
};
