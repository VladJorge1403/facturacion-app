import * as Print from 'expo-print';
import { Platform } from 'react-native';

const limpiar = (valor) => String(valor ?? '').replace(/undefined|null/g, '');

export const generarPdfFactura = async (
  factura,
  logoBase64,
  ventanaPDF = null
) => {
  const fecha = factura.fecha || {};
  const ajustes = factura.ajustes || {};

  const filasConDatos = (factura.filas || []).filter(
    (fila) => fila.descripcion && fila.descripcion !== 'Tocar para agregar'
  );

  const filasHtml = filasConDatos
    .map(
      (fila) => `
        <tr>
          <td class="cant">${limpiar(fila.cantidad)}</td>
          <td class="ref">${limpiar(fila.referencia)}</td>
          <td class="desc">${limpiar(fila.descripcion)}</td>
          <td class="precio">${limpiar(fila.precio)}</td>
          <td class="total">${limpiar(fila.total)}</td>
        </tr>
      `
    )
    .join('');

  const envio = Number(ajustes.envio || 0);
  const instalacion = Number(ajustes.instalacion || 0);
  const descuento = Number(ajustes.descuento || 0);

  const ajustesHtml = `
    ${
      envio > 0
        ? `<tr>
            <td class="cant"></td>
            <td class="ref"></td>
            <td class="desc">Transporte / envío</td>
            <td class="precio"></td>
            <td class="total">${envio.toFixed(2)}</td>
          </tr>`
        : ''
    }

    ${
      instalacion > 0
        ? `<tr>
            <td class="cant"></td>
            <td class="ref"></td>
            <td class="desc">Instalación</td>
            <td class="precio"></td>
            <td class="total">${instalacion.toFixed(2)}</td>
          </tr>`
        : ''
    }

    ${
      descuento > 0
        ? `<tr>
            <td class="cant"></td>
            <td class="ref"></td>
            <td class="desc">Descuento</td>
            <td class="precio"></td>
            <td class="total">-${descuento.toFixed(2)}</td>
          </tr>`
        : ''
    }
  `;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />

      <style>
        @page {
          size: A4;
          margin: 10mm;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: white;
        }

        .factura {
          width: 720px;
          margin: 0 auto;
          background: white;
          padding: 14px;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .leftHeader {
          width: 62%;
        }

        .rightHeader {
          width: 35%;
          text-align: center;
        }

        .logo {
          width: 290px;
          height: 125px;
          object-fit: contain;
          margin-left: -10px;
        }

        .address {
          font-size: 18px;
          font-weight: bold;
          margin-top: 6px;
        }

        .reciboTitle {
          background: #0b376b;
          color: white;
          font-weight: bold;
          font-size: 18px;
          padding: 7px;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
        }

        .reciboNumber {
          border: 1px solid #0b376b;
          border-top: none;
          color: #d85c42;
          font-size: 32px;
          font-weight: bold;
          padding: 9px;
        }

        .fechaTitle {
          color: #0b376b;
          font-weight: bold;
          margin-top: 10px;
          font-size: 16px;
          letter-spacing: 1px;
        }

        .dateTable {
          border-collapse: collapse;
          margin: 3px auto;
        }

        .dateTable th {
          background: #0b376b;
          color: white;
          font-size: 12px;
          padding: 3px 9px;
        }

        .dateTable td {
          border: 1px solid #0b376b;
          font-size: 15px;
          padding: 7px 10px;
          text-align: center;
        }

        .phone {
          color: #d85c42;
          font-weight: bold;
          font-size: 13px;
          line-height: 1.4;
        }

        .cliente {
          margin-top: 16px;
          border: 1px solid black;
          border-radius: 6px;
          padding: 10px;
          color: #0b376b;
          font-weight: bold;
        }

        table.productos {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }

        .productos th,
        .productos td {
          border: 1px solid black;
          padding: 7px;
          font-size: 12px;
          vertical-align: top;
        }

        .productos th {
          color: #0b376b;
          font-weight: bold;
          text-align: center;
        }

        .cant {
          width: 9%;
          text-align: center;
        }

        .ref {
          width: 18%;
        }

        .desc {
          width: 47%;
        }

        .precio,
        .total {
          width: 13%;
          text-align: center;
        }

        .bottom {
          display: flex;
          border: 1px solid black;
          border-top: none;
          height: 42px;
        }

        .son {
          flex: 1;
          padding: 12px 8px;
          color: #0b376b;
          font-weight: bold;
        }

        .totalFinal {
          width: 190px;
          border-left: 1px solid black;
          display: flex;
          align-items: center;
          justify-content: space-around;
          color: #0b376b;
          font-weight: bold;
        }

        .totalFinal span:last-child {
          color: black;
          font-weight: normal;
        }
      </style>
    </head>

    <body>
      <div class="factura">
        <div class="top">
          <div class="leftHeader">
            <img class="logo" src="${logoBase64}" />

            <div class="address">
              Calle Antigua a<br/>
              Zacatecoluca San Marcos
            </div>
          </div>

          <div class="rightHeader">
            <div class="reciboTitle">RECIBO</div>
            <div class="reciboNumber">${factura.numeroRecibo || '----'}</div>

            <div class="fechaTitle">FECHA</div>

            <table class="dateTable">
              <tr>
                <th>DIA</th>
                <th>MES</th>
                <th>AÑO</th>
              </tr>
              <tr>
                <td>${fecha.dia || ''}</td>
                <td>${fecha.mes || ''}</td>
                <td>${fecha.anio || ''}</td>
              </tr>
            </table>

            <div class="phone">
              Tel.: 2213-0460<br/>
              7406-8290<br/>
              Cel.: 7629-5889
            </div>
          </div>
        </div>

        <div class="cliente">
          CLIENTE: ${limpiar(factura.cliente)}
        </div>

        <table class="productos">
          <thead>
            <tr>
              <th class="cant">CANT</th>
              <th class="ref">REFERENCIA</th>
              <th class="desc">DESCRIPCIÓN</th>
              <th class="precio">PRECIO</th>
              <th class="total">TOTAL</th>
            </tr>
          </thead>

          <tbody>
            ${filasHtml}
            ${ajustesHtml}
          </tbody>
        </table>

        <div class="bottom">
          <div class="son">SON:</div>

          <div class="totalFinal">
            <strong>TOTAL</strong>
            <span>$${factura.total || '0'}</span>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;

  if (Platform.OS === 'web') {
    const ventana = ventanaPDF || window.open('', '_blank');

    if (!ventana) {
      alert('El navegador bloqueó la ventana. Permite ventanas emergentes.');
      return null;
    }

    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();

    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 800);

    return null;
  }

  const archivo = await Print.printToFileAsync({ html });
  return archivo.uri;
};