from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

import json
import uuid

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Load the initial database.json content
with open("Database.json", "r") as file:
    database = json.load(file)

@app.route('/api/entities', methods=['GET'])
@cross_origin()
def get_all_entities():
    return jsonify(database), 200

@app.route('/api/entities/create', methods=['POST'])
def create_entity():
    data = request.json
    entity_type = data.get('type')
    parent_entity_type = data.get('parentType')

    if entity_type == 'category':
        new_entity = create_category(data)
    elif entity_type == 'subcategory' or parent_entity_type == 'category':
        new_entity = create_subcategory(data)
    elif entity_type == 'moodboardtype' or parent_entity_type == 'subcategory':
        new_entity = create_moodboardtype(data)
    elif entity_type == 'furnituretype' or parent_entity_type == 'moodboardtype':
        new_entity = create_furnituretype(data)
    else:
        return jsonify({"error": "Invalid entity type"}), 400

    save_to_json(database)
    return jsonify(new_entity), 201


def create_category(data):
    new_category = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "metadata": {
            "entitytype": "category",
            "url": data["url"],
            "murl": data["murl"]
        },
        "children": []
    }
    database["categories"].append(new_category)
    return new_category


def create_subcategory(data):
    category_id = data["parentId"]
    new_subcategory = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "metadata": {
            "entitytype": "subcategory",
            "url": data["url"],
            "murl": data["murl"]
        },
        "children": []
    }
    for category in database["categories"]:
        if category["id"] == category_id:
            category["children"].append(new_subcategory)
            break
    else:
        return jsonify({"error": "Category not found"}), 404
    return new_subcategory


def create_moodboardtype(data):
    subcategory_id = data["parentId"]
    new_moodboardtype = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "metadata": {
            "entitytype": "moodboardtype",
            "url": data["url"],
            "murl": data["murl"]
        },
        "children": []
    }
    for category in database["categories"]:
        for subcategory in category["children"]:
            if subcategory["id"] == subcategory_id:
                subcategory["children"].append(new_moodboardtype)
                break
        else:
            continue
        break
    else:
        return jsonify({"error": "Subcategory not found"}), 404
    return new_moodboardtype


def create_furnituretype(data):
    moodboardtype_id = data["parentId"]
    new_furnituretype = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "metadata": {
            "entitytype": "furnituretype",
            "url": data["url"],
            "murl": data["murl"],
            "annotations": data["annotations"]
        }
    }
    for category in database["categories"]:
        for subcategory in category["children"]:
            for moodboardtype in subcategory["children"]:
                if moodboardtype["id"] == moodboardtype_id:
                    moodboardtype["children"].append(new_furnituretype)
                    break
            else:
                continue
            break
        else:
            continue
        break
    else:
        return jsonify({"error": "Moodboard type not found"}), 404
    return new_furnituretype


@app.route('/api/entities', methods=['PUT'])
def update_entity():
    data = request.json
    entity_id = data.get('id')
    entity_type = data.get('type')

    if entity_type == 'category':
        updated_entity = update_category(data)
    elif entity_type == 'subcategory':
        updated_entity = update_subcategory(data)
    elif entity_type == 'moodboardtype':
        updated_entity = update_moodboardtype(data)
    elif entity_type == 'furnituretype':
        updated_entity = update_furnituretype(data)
    else:
        return jsonify({"error": "Invalid entity type"}), 400

    save_to_json(database)
    return jsonify(updated_entity), 200


def update_category(data):
    category_id = data['id']
    updated_category = next((category for category in database['categories'] if category['id'] == category_id), None)
    if updated_category:
        updated_category.update(data)
        return updated_category
    else:
        return jsonify({"error": "Category not found"}), 404


def update_subcategory(data):
    subcategory_id = data['id']
    for category in database['categories']:
        for subcategory in category.get('children', []):
            if subcategory['id'] == subcategory_id:
                subcategory.update(data)
                return subcategory
    return jsonify({"error": "Subcategory not found"}), 404


def update_moodboardtype(data):
    moodboardtype_id = data['id']
    for category in database['categories']:
        for subcategory in category.get('children', []):
            for moodboardtype in subcategory.get('children', []):
                if moodboardtype['id'] == moodboardtype_id:
                    moodboardtype.update(data)
                    return moodboardtype
    return jsonify({"error": "Moodboard type not found"}), 404


def update_furnituretype(data):
    furnituretype_id = data['id']
    for category in database['categories']:
        for subcategory in category.get('children', []):
            for moodboardtype in subcategory.get('children', []):
                for furnituretype in moodboardtype.get('children', []):
                    if furnituretype['id'] == furnituretype_id:
                        furnituretype.update(data)
                        return furnituretype
    return jsonify({"error": "Furniture type not found"}), 404

@app.route('/api/entities/<node_id>', methods=['DELETE'])
def delete_entity(node_id):
    if not node_id:
        return jsonify({"error": "Node ID is required"}), 400

    entity_deleted = delete_node(database["categories"], node_id)
    if entity_deleted:
        save_to_json(database)
        return jsonify({"message": "Entity and its descendants deleted successfully"}), 200
    else:
        return jsonify({"error": "Entity not found"}), 404


def delete_node(nodes, node_id):
    for node in nodes:
        if node["id"] == node_id:
            nodes.remove(node)
            return True
        if "children" in node:
            if delete_node(node["children"], node_id):
                return True
    return False



def save_to_json(data):
    with open("Database.json", "w") as file:
        json.dump(data, file, indent=2)


if __name__ == '__main__':
    app.run(debug=True)
