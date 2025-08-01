import { z } from "zod";

// const DiscountType = z.enum(["FIXED", "PERCENTAGE"]);
// const PriceType = z.enum(["FIXED", "PERCENTAGE"]);

// export const saleRecipientSchema = z.object({
//   firstname: z.string().trim().min(2, "Firstname is required"),
//   lastname: z.string().trim().min(2, "Lastname is required"),
//   address: z.string().trim().min(1, "Address is required"),
//   phone: z.string().trim().min(10, "Phone number is required"),
//   email: z.string().trim().email("Invalid email"),
// })
//   .superRefine((data, ctx) => {
//     // if you still want a top‐level “Recipient is required” when all sub-fields are empty:
//     const r = data;
//     if (
//       !r.firstname &&
//       !r.lastname &&
//       !r.address &&
//       !r.phone &&
//       !r.email
//     ) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["firstname"],
//         message: "Recipient is required",
//       });
//     }
//     // … any other cross-field checks …
//   });



// export const saleRecipientSchema = z
//   .object({
//     firstname: z
//       .string()
//       .trim()
//       .optional()                          // <-- make optional
//       .refine(
//         (v) => v === undefined || v.length === 0 || v.length >= 2,
//         { message: "Firstname is required" }
//       ),
//     lastname: z
//       .string()
//       .trim()
//       .optional()
//       .refine(
//         (v) => v === undefined || v.length === 0 || v.length >= 2,
//         { message: "Lastname is required" }
//       ),
//     address: z
//       .string()
//       .trim()
//       .optional()
//       .refine(
//         (v) => v === undefined || v.length === 0 || v.length >= 1,
//         { message: "Address is required" }
//       ),
//     phone: z
//       .string()
//       .trim()
//       .optional()
//       .refine(
//         (v) => v === undefined || v.length === 0 || v.length >= 10,
//         { message: "Phone number is required" }
//       ),
//     email: z
//       .string()
//       .trim()
//       .optional()
//       .refine(
//         (v) => v === undefined || v.length === 0 || /^[^@]+@[^@]+\.[^@]+$/.test(v),
//         { message: "Invalid email" }
//       ),
//   })
//   .superRefine((data, ctx) => {
//     const { firstname, lastname, address, phone, email } = data;
//     const allEmpty =
//       [firstname, lastname, address, phone, email].every(
//         (v) => v === undefined || v === ""
//       );



//     if (allEmpty) {
//       // emit exactly one “recipient is required” on firstname (or use path: [] for form-level)
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["firstname"],
//         message: "Recipient is required",
//       });
//     }
//   });

export const saleRecipientSchema = z
  .object({
    firstname: z.string().trim().optional(),
    lastname: z.string().trim().optional(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().optional(),
  })
  // if *every* field is blank, emit one top-level error on saleRecipient
  .refine((r) => {
    return [r.firstname, r.lastname, r.address, r.phone, r.email].some(
      (v) => v !== undefined && v !== ""
    );
  }, {
    path: ["saleRecipient"],
    message: "Recipient is required",
  })
  // but if user has typed into individual fields, still enforce per-field rules:
  .superRefine((r, ctx) => {
    if (r.firstname != null && r.firstname.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["saleRecipient", "firstname"],
        message: "Firstname is required",
      });
    }
    if (r.lastname != null && r.lastname.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["saleRecipient", "lastname"],
        message: "Lastname is required",
      });
    }

    if (r.address != null && r.address.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["saleRecipient", "address"],
        message: "Address is required",
      });
    }

    // PHONE: if non-empty, must be at least 10 digits and only digits
    if (r.phone != null && r.phone.trim() !== "" && r.phone.trim().length < 11) {
      const digits = r.phone.replace(/\D/g, "");
      if (digits.length < 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["saleRecipient", "phone"],
          message: "Phone number must be at least 10 digits",
        });
      } else if (!/^\d+$/.test(r.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["saleRecipient", "phone"],
          message: "Phone number can only contain digits",
        });
      }
    } else if (r.phone == null || r.phone.trim() === "" || r.phone === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["saleRecipient", "phone"],
        message: "Cant be empty",
      });
    }


    if (r.email != null && r.email.trim() !== "") {
      const email = r.email.trim();
      // simple RFC-ish regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["saleRecipient", "email"],
          message: "Invalid email address",
        });
      }
    }

  });


export const identificationDetailsSchema = z
  .object({
    idType: z.string().trim().min(2, "ID Type is required"),
    idNumber: z.string().trim().min(5, "ID Number is required"),
    issuingCountry: z.string().trim().min(2, "Issuing Country is required"),
    issueDate: z
      .string()
      .trim()
      .nonempty({ message: "Issue date is required" })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid issue date",
      })
      .refine((date) => new Date(date) <= new Date(), {
        message: "Issue date cannot be in the future",
      }),

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
    fullNameAsOnID: z.string().trim().min(3, "Full name as on ID is required"),
    addressAsOnID: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.issueDate && data.expirationDate) {
      const issueDate = new Date(data.issueDate);
      const expirationDate = new Date(data.expirationDate);

      if (expirationDate <= issueDate) {
        ctx.addIssue({
          code: "custom",
          path: ["expirationDate"],
          message: "Expiration date must be later than issue date",
        });
      }
    }
  });

export const nextOfKinDetailsSchema = z.object({
  fullName: z.string().trim().min(3, "Full name is required"),
  relationship: z.string().trim().min(2, "Relationship is required"),
  phoneNumber: z.string().trim().min(10, "Phone number is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  homeAddress: z.string().trim(),
  dateOfBirth: z
    .string()
    .trim()
    .nonempty({ message: "Issue date is required" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date of birth",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  nationality: z.string().trim(),
});

export const guarantorDetailsSchema = z.object({
  fullName: z.string().trim().min(3, "Full name is required"),
  phoneNumber: z.string().trim().min(10, "Phone number is required"),
  email: z.string().trim().email("Invalid email").or(z.literal("")),
  homeAddress: z.string().trim().min(1, "Home address is required"),
  dateOfBirth: z
    .string()
    .trim()
    .nonempty({ message: "Issue date is required" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date of birth",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  nationality: z.string().trim(),
  identificationDetails: identificationDetailsSchema,
});

// const parametersSchema = z
//   .object({
//     paymentMode: z.enum(["ONE_OFF", "INSTALLMENT"], {
//       message: "Payment mode is required",
//     }),
//     discount: z.number().min(0, "Discount must be non-negative").optional(),
//     discountType: DiscountType,
//     // These two only matter when paymentMode === INSTALLMENT:
//     installmentDuration: z.number().optional(),
//     installmentStartingPrice: z.number().optional(),
//     installmentStartingPriceType: PriceType.optional(),
//   })
//   .refine((p) => {
//     // if they never touched ANY of the above, we want one single error
//     return (
//       p.paymentMode !== undefined ||
//       p.discountType !== undefined ||
//       p.discount !== undefined
//     );
//   }, {
//     message: "Parameters are required",
//     path: ["paymentMode"],        // or just `["parameters"]` in your superRefine
//   })
//   .superRefine((params, ctx) => {
//     if (params.paymentMode === "INSTALLMENT") {
//       if (params.installmentDuration == null) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Installment duration is required for installment plans",
//           path: ["installmentDuration"],
//         });
//       }
//       if (params.installmentStartingPrice == null) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message:
//             "Installment starting price is required for installment plans",
//           path: ["installmentStartingPrice"],
//         });
//       }
//       if (!params.installmentStartingPriceType) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "You must pick a price type for installment starting price",
//           path: ["installmentStartingPriceType"],
//         });
//       }
//     }
//   });

const parametersSchema = z
  .object({
    paymentMode: z.enum(["ONE_OFF", "INSTALLMENT"], {
      required_error: "Payment mode is required",
    }).optional(),              // make optional so refine can catch "all empty"
    discount: z.number().min(0, "Discount must be non-negative").optional(),
    discountType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
    installmentDuration: z.number().optional(),
    installmentStartingPrice: z.number().optional(),
    installmentStartingPriceType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
  })
  // if *every* field is undefined/null, fire one top-level error
  .refine((p) => {
    return Object.values(p).some((v) => v !== undefined && v !== null);
  }, {
    path: ["parameters"],
    message: "Parameters are required",
  })
  .superRefine((p, ctx) => {
    if (p.paymentMode === "INSTALLMENT") {
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
      if (!p.installmentStartingPriceType) {
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
    // paymentMode: z.enum(["ONE_OFF", "INSTALLMENT"], {
    //   message: "Payment Mode is required",
    // }),
    // discount: z.number().optional(),
    // installmentDuration: z.number().optional(),
    // installmentStartingPrice: z.number().optional(),
    devices: z.array(z.string()).min(1, "At least one device is required"),
    miscellaneousPrices: z
      .record(z.string(), z.number().min(0, "Price must be a positive number"))
      .optional(),
    saleRecipient: saleRecipientSchema,
    parameters: parametersSchema
  })
  .superRefine((data, ctx) => {
    const r = data.saleRecipient;
    if (
      !r.firstname ||
      !r.lastname ||
      !r.address ||
      !r.phone ||
      !r.email
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["saleRecipient"],
        message: "Recipient is required",
      });
    }
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
    saleItems: z
      .array(saleItemSchema)
      .min(1, "At least one sale item is required"),
    bvn: z
      .string()
      .length(11, "BVN must be exactly 11 digits")
      .regex(/^\d+$/, "BVN must contain only numbers")
      .optional(),
    identificationDetails: identificationDetailsSchema.optional(),
    nextOfKinDetails: nextOfKinDetailsSchema.optional(),
    guarantorDetails: guarantorDetailsSchema.optional(),
    applyMargin: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // Check if any sale item has paymentMode as "INSTALLMENT"
    const hasInstallment = data.saleItems.some(
      (item) => item.parameters.paymentMode === "INSTALLMENT"
    );

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
      if (!data.nextOfKinDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Next of kin details are required for installment payments",
          path: ["nextOfKinDetails"],
        });
      } else {
        // Validate the nested schema for nextOfKinDetails
        const nextOfKinValidation = nextOfKinDetailsSchema.safeParse(
          data.nextOfKinDetails
        );
        if (!nextOfKinValidation.success) {
          nextOfKinValidation.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["nextOfKinDetails", ...issue.path],
            });
          });
        }
      }

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
  quantity: number;
  paymentMode: "INSTALLMENT" | "ONE_OFF";
  discount?: number;
  installmentDuration?: number;
  installmentStartingPrice?: number;
  devices: string[];
  miscellaneousPrices?: {
    [key: string]: number;
  };
  saleRecipient: {
    firstname: string;
    lastname: string;
    address: string;
    phone: string;
    email: string;
  };
};

type NextOfKinDetails = {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  homeAddress: string;
  dateOfBirth: string;
  nationality: string;
};

type IdentificationDetails = {
  idType: string;
  idNumber: string;
  issuingCountry: string;
  issueDate: string;
  expirationDate: string;
  fullNameAsOnID: string;
  addressAsOnID: string;
};

type GuarantorDetails = {
  fullName: string;
  phoneNumber: string;
  email: string;
  homeAddress: string;
  identificationDetails: IdentificationDetails;
  dateOfBirth: string;
  nationality: string;
};

export type SalePayload = {
  category: "PRODUCT";
  customerId: string;
  bvn?: string;
  saleItems: SaleItem[];
  nextOfKinDetails?: NextOfKinDetails;
  identificationDetails?: IdentificationDetails;
  guarantorDetails?: GuarantorDetails;
  applyMargin: boolean;
};

export const defaultSaleFormData: SalePayload = {
  category: "PRODUCT",
  customerId: "",
  applyMargin: true,
  bvn: "",
  saleItems: [],
  nextOfKinDetails: {
    fullName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
  },
  identificationDetails: {
    idType: "",
    idNumber: "",
    issuingCountry: "",
    issueDate: "",
    expirationDate: "",
    fullNameAsOnID: "",
    addressAsOnID: "",
  },
  guarantorDetails: {
    fullName: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
    identificationDetails: {
      idType: "",
      idNumber: "",
      issuingCountry: "",
      issueDate: "",
      expirationDate: "",
      fullNameAsOnID: "",
      addressAsOnID: "",
    },
  },
};
