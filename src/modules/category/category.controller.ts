import { Request, Response } from "express";
import categoryService from "./category.service";
import type { CategoryCreateDTO, CategoryUpdateDTO } from "./category.dto";

class CategoryController {
  async createCategory(req: Request, res: Response): Promise<Response> {
    const data: CategoryCreateDTO = req.body;
    try {
      const category = await categoryService.createCategory(data);
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<Response> {
    const data: CategoryUpdateDTO = req.body;
    try {
      const { id } = req.params;
      const category = await categoryService.update(data, id);
      return res.status(200).json(category);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await categoryService.getAll();
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await categoryService.getById(id);
      return res.status(200).json(category);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getProductsWithCategory(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await categoryService.productsWithCategory(id);
      return res.status(200).json(category);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new CategoryController();
