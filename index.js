// install express with `npm install express` 
const express = require('express');
const Deta = require("deta");
const deta = Deta('project_key'); // configure your Deta project
const userDB = deta.Base('users');

const app = express();

function getDatabase(project, type) {
    return deta.Base(project + "_" + type);
}

app.use(express.json());

app.get('/', (req, res) => res.send('Translation API v0.1'));

app.post('/:project/language', async (req, res) => {
    const { project } = req.params;
    const { local_name, global_name, language_key } = req.body;
    const toCreate = { local_name, global_name };
    const insertedLanguage = await getDatabase(project, 'language').put(toCreate, language_key);
    res.status(201).json(insertedLanguage);
});

app.get('/:project/language/:id', async (req, res) => {
   const { id, project } = req.params;
   const language = await getDatabase(project, 'language').get(id);
   if(language) {
       res.json(language);
   } else {
       res.status(404).json({"message": "language not found"});
   }
});

app.put('/:project/language/:id', async (req, res) => {
   const { id, project } = req.params;
   const { name, shortname, language_key } = req.body;
   const toPut = { key: id, name, shortname };
   const newLanguage = await getDatabase(project, 'language').put(toPut, language_key);
   return res.json(newLanguage);
});

app.delete('/:project/language/:id', async (req, res) => {
   const { id, project } = req.params;
   await getDatabase(project, 'language').delete(id);
   res.json({"message": "language deleted"});
});

app.post('/:project/string', async (req, res) => {
    const { project } = req.params;
    const { string_key, project_key, description } = req.body;
    const toCreate = { description, project_key };
    const insertedString = await getDatabase(project, 'string').put(toCreate, string_key);
    res.status(201).json(insertedString);
});

app.put('/:project/string/:id', async (req, res) => {
    const { id, project } = req.params;
    const { description, project_key } = req.body;
    const toPut = { key: id, description, project_key };
    const newString = await getDatabase(project, 'string').put(toPut, id);
    res.status(201).json(newString);
});

app.get('/:project/string/:id', async (req, res) => {
    const { project, id } = req.params;
    const string = await getDatabase(project, 'string').get(id);
    if(string) {
        const { value: translations } = await getDatabase(project, 'translation').fetch({"string_key": id}, 1000, 1000).next();
        res.json({string, translations});
    } else {
        res.status(404).json({"message": "string not found"});
    }
});

app.delete('/:project/string/:id', async (req, res) => {
    const { id, project } = req.params;
    await getDatabase(project, 'string').delete(id);
    // todo: delete translationDB entries for this string!
    res.json({"message": "string and translations deleted"});
});

app.get('/:project/translation/:id', async (req, res) => {
    const { id, project } = req.params;
    const translation = await getDatabase(project, 'translation').get(id);
    if(translation) {
        res.json(translation);
    } else {
        res.status(404).json({"message":"translation not found"});
    }
});

app.post('/:project/translation', async (req, res) => {
    const { project } = req.params;
    const { language_key, string_key, project_key, translation } = req.body;
    const toCreate = { language_key, string_key, project_key, translation };
    const insertedTranslation = await getDatabase(project, 'translation').put(toCreate);
    res.status(201).json(insertedTranslation);
});

app.put('/:project/translation/:id', async (req, res) => {
    const { id, project } = req.params;
    const { language_key, string_key, project_key, translation } = req.body;
    const toPut = { key: id, language_key, project_key, string_key, translation };
    const newTranslation = await getDatabase(project, 'translation').put(toPut);
    res.status(201).json(newTranslation);
});

app.delete('/:project/translation/:id', async (req, res) => {
    const { id, project } = req.params;
    await getDatabase(project, 'translation').delete(id);
    res.json({"message": "translation deleted"});
});

// export 'app'
module.exports = app