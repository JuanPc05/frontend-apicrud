const { getPool } = require("../database/connection")
const { handleError } = require("../utils/errorHandler")

// Obtener todos los pedidos o uno por ID
// Obtener todos los pedidos o uno por ID
const getPedidos = async (req, res) => {
  try {
    const { id } = req.params
    const pool = getPool()
    const connection = await pool.getConnection()

    if (id) {
      // Obtener pedido individual con su total calculado
      const [pedidos] = await connection.query(
        `SELECT p.*, c.nombre, c.apellido, c.email, 
         (COALESCE((SELECT SUM(precio * cantidad) FROM detalle_pedido WHERE id_pedido = p.id), 0) + p.aumento - p.descuento) AS total_calculado
        FROM pedido p 
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente 
        WHERE p.id = ?`,
        [id],
      )

      if (pedidos.length > 0) {
        const pedido = pedidos[0]

        // Obtener detalles del pedido
        const [detalles] = await connection.query(
          `SELECT dp.*, pr.nombre as producto_nombre 
          FROM detalle_pedido dp 
          INNER JOIN productos pr ON dp.id_producto = pr.id 
          WHERE dp.id_pedido = ?`,
          [id],
        )

        pedido.detalles = detalles
        res.json(pedido)
      } else {
        res.status(404).json({ message: "Pedido no encontrado" })
      }
    } else {
      // LISTADO GENERAL: Se calcula el total agrupando los detalles
      const [rows] = await connection.query(
        `SELECT 
            p.id, p.id_cliente, p.descuento, p.metodo_pago, p.aumento, p.fecha, 
            c.nombre, c.apellido, c.email,
            (COALESCE(SUM(dp.precio * dp.cantidad), 0) + p.aumento - p.descuento) AS total_calculado
        FROM pedido p 
        INNER JOIN clientes c ON p.id_cliente = c.id_cliente 
        LEFT JOIN detalle_pedido dp ON p.id = dp.id_pedido
        GROUP BY p.id, p.id_cliente, p.descuento, p.metodo_pago, p.aumento, p.fecha, c.nombre, c.apellido, c.email
        ORDER BY p.id DESC`
      )
      res.json(rows)
    }

    connection.release()
  } catch (error) {
    handleError(res, error, "Error al obtener pedidos")
  }
}

// Crear pedido
const createPedido = async (req, res) => {
  try {
    const { id_cliente, descuento, metodo_pago, aumento, productos } = req.body

    if (!id_cliente || !metodo_pago || !productos || productos.length === 0) {
      return res.status(400).json({ message: "Cliente, método de pago y productos son requeridos" })
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Crear el pedido
      const [pedidoResult] = await connection.query(
        "INSERT INTO pedido (id_cliente, descuento, metodo_pago, aumento) VALUES (?, ?, ?, ?)",
        [id_cliente, descuento || 0, metodo_pago, aumento || 0],
      )
      const pedidoId = pedidoResult.insertId

      // Agregar productos al detalle del pedido
      for (const producto of productos) {
        await connection.query(
          "INSERT INTO detalle_pedido (id_pedido, id_producto, precio, cantidad) VALUES (?, ?, ?, ?)",
          [pedidoId, producto.id_producto, producto.precio, producto.cantidad],
        )

        // Actualizar stock
        await connection.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [
          producto.cantidad,
          producto.id_producto,
        ])
      }

      await connection.commit()

      res.status(201).json({
        message: "Pedido creado con éxito",
        id: pedidoId,
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    handleError(res, error, "Error al crear pedido")
  }
}

// Actualizar pedido
const updatePedido = async (req, res) => {
  try {
    const { id } = req.params
    const { id_cliente, descuento, metodo_pago, aumento, productos } = req.body

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // 1. Actualizar los datos principales de la tabla pedido
      const [result] = await connection.query(
        "UPDATE pedido SET id_cliente = ?, descuento = ?, metodo_pago = ?, aumento = ? WHERE id = ?",
        [id_cliente, descuento || 0, metodo_pago, aumento || 0, id],
      )

      if (result.affectedRows === 0) {
        await connection.rollback()
        connection.release()
        return res.status(404).json({ message: "Pedido no encontrado" })
      }

      // 2. Si el frontend envía la lista de productos actualizada, sincronizamos el detalle
      if (productos && productos.length > 0) {
        // Borramos los detalles viejos de este pedido
        await connection.query("DELETE FROM detalle_pedido WHERE id_pedido = ?", [id])

        // Insertamos los nuevos productos actualizados
        for (const producto of productos) {
          await connection.query(
            "INSERT INTO detalle_pedido (id_pedido, id_producto, precio, cantidad) VALUES (?, ?, ?, ?)",
            [id, producto.id_producto, producto.precio, producto.cantidad],
          )

          // Descontar stock del producto actualizado
          await connection.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [
            producto.cantidad,
            producto.id_producto,
          ])
        }
      }

      await connection.commit()
      connection.release()

      res.json({ message: "Pedido actualizado con éxito" })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    handleError(res, error, "Error al actualizar pedido")
  }
}

// Eliminar pedido
const deletePedido = async (req, res) => {
  try {
    const { id } = req.params

    const pool = getPool()
    const connection = await pool.getConnection()
    const [result] = await connection.query("DELETE FROM pedido WHERE id = ?", [id])
    connection.release()

    if (result.affectedRows > 0) {
      res.json({ message: "Pedido eliminado con éxito" })
    } else {
      res.status(404).json({ message: "Pedido no encontrado" })
    }
  } catch (error) {
    handleError(res, error, "Error al eliminar pedido")
  }
}

module.exports = {
  getPedidos,
  createPedido,
  updatePedido,
  deletePedido,
}
