{
  "data": [
    {
      "id": "concepts",
      "label": "Datos del Calendario",
      "elements": [
        {
          "id": "fecha",
          "label": "Fecha",
          "type": "dimension",
          "options": { "min": 1, "max": 1 }
        },
        {
          "id": "tarea",
          "label": "Nombre de Task",
          "type": "dimension",
          "options": { "min": 1, "max": 1 }
        },
        {
          "id": "estado",
          "label": "Estado / Categoria",
          "type": "dimension",
          "options": { "min": 0, "max": 1 }
        },
        {
          "id": "metrica",
          "label": "Metrica",
          "type": "metric",
          "options": { "min": 0, "max": 1 }
        }
      ]
    }
  ],
  "style": [
    {
      "id": "opciones",
      "label": "Opciones del Calendario",
      "elements": [
        {
          "id": "mostrarMetrica",
          "label": "Mostrar metrica en chips",
          "type": "boolean",
          "defaultValue": true
        }
      ]
    }
  ]
}