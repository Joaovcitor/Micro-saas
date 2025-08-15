import type { CreateProductDTO } from "../dtos/createProductDTO";
import type { UpdateProductDTO } from "../dtos/updateProductDTO";
import productsService from "../services/products.service";
import { Request, Response } from "express";
class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<Response> {
    try {
      const products = await productsService.getAllProducts();
      return res.status(200).json(products);
    } catch (e: unknown) {
      return res.status(500).json({ errors: "erro interno do servidor!" });
    }
  }

  async getProductById(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id, 10);
    try {
      const product = await productsService.getProductById(id);
      if (!product) {
        return res.status(404).json({ errors: "Produto não encontrado!" });
      }
      return res.status(200).json(product);
    } catch (e: unknown) {
      console.log(e);
      return res.status(500).json({ errors: "Erro interno do servidor!" });
    }
  }
  async create(req: Request, res: Response): Promise<Response> {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(400).json({ error: "Você tem que estar autenticado" });
    }

    const { name, price, description } = req.body;

    // Converter price para número
    const priceNumber = parseFloat(price);
    console.log(priceNumber);
    if (isNaN(priceNumber)) {
      return res.status(400).json({ error: "Preço inválido" });
    }

    // Validar arquivos enviados
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res
        .status(400)
        .json({ error: "O produto tem que ter pelo menos uma foto!" });
    }

    // Mapear fotos enviadas
    const photos = (req.files as Express.Multer.File[]).map(
      (file) => `/uploads/${file.filename}`
    );

    try {
      const product = await productsService.create(
        {
          name,
          price: priceNumber,
          description,
          photos, // agora passando as fotos no DTO
        },
        ownerId,
        photos // e também aqui, caso seu service precise separadamente
      );

      return res.status(201).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    const data: UpdateProductDTO = req.body;
    const id = parseInt(req.params.id, 10);
    try {
      const product = await productsService.update(id, data);
      if (!product) {
        return res.status(404).json({ errors: "Produto não encontrado!" });
      }
      return res.status(200).json(product);
    } catch (e: unknown) {
      console.log(e);
      return res.status(500).json({ errors: "Erro interno do servidor!" });
    }
  }
}

export default new ProductController();
