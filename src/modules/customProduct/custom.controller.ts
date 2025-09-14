import { Request, Response } from "express";
import { CustomProductService } from "./custom.service";
import type {
  CustomizationOptionDTOCreate,
  ProductCustomizationDTOCreate,
} from "./custom.dto";

export class CustomProductController {
  private customProductService: CustomProductService;
  constructor() {
    this.customProductService = new CustomProductService();
  }
  create = async (req: Request, res: Response): Promise<void> => {
    const data: ProductCustomizationDTOCreate = req.body;
    try {
      const customProduct = await this.customProductService.create(data);
      res.status(201).json({
        message: "Produto personalizado criado com sucesso",
        data: customProduct,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao criar produto personalizado",
        error: e.message,
      });
    }
  };
  getCustomizationProductById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    try {
      const customProduct =
        await this.customProductService.getCustomizationProductById(id);
      res.status(200).json({
        message: "Produto personalizado encontrado com sucesso",
        data: customProduct,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao buscar produto personalizado",
        error: e.message,
      });
    }
  };
  addNewOptionInProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const data: CustomizationOptionDTOCreate = req.body;
    try {
      const customProduct =
        await this.customProductService.addNewOptionInProduct(id, data);
      res.status(200).json({
        message: "Opção personalizada adicionada com sucesso",
        data: customProduct,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao adicionar opção personalizada",
        error: e.message,
      });
    }
  };
  getAllCustomizationOptions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const customOptions = await this.customProductService.getAll();
      res.status(200).json(customOptions);
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao buscar opções personalizadas",
        error: e.message,
      });
    }
  };
}
