// Product Care Instruction Types

export interface ProductCareInstruction {
  id: string;
  productId: string;
  careInstructionId: string;
  order: number;
  createdAt: string;
}

export interface CreateProductCareInstructionRequest {
  careInstructionId: string;
  order?: number;
}
