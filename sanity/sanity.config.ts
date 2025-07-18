import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {markdownSchema} from 'sanity-plugin-markdown'
import {cloudinarySchemaPlugin} from 'sanity-plugin-cloudinary'
import {muxInput} from 'sanity-plugin-mux-input'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'codetv.dev',

  projectId: 'vnkupgyb',
  dataset: 'develop',

  plugins: [
    visionTool(),
    markdownSchema(),
    cloudinarySchemaPlugin(),
    muxInput({
      tool: false,
    }),
    structureTool({
      structure: (S) => {
        return S.list()
          .title('Content')
          .items(
            S.documentTypeListItems().filter(
              (li) =>
                !['Episode', 'Collection', 'Episode Tag', 'Video asset'].includes(
                  li.getTitle() ?? '',
                ),
            ),
          )
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
