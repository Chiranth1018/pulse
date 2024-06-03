"use client"; 
import { FaEdit, FaRegFolder, FaRegFolderOpen } from "react-icons/fa";
import { FaChessBoard, FaPlus } from "react-icons/fa6";
import { LuSofa } from "react-icons/lu";
import { MdDelete, MdOutlineCategory, MdOutlineCreateNewFolder } from "react-icons/md";
import { TbCategory } from "react-icons/tb";
import { TiFlowChildren } from "react-icons/ti";
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import TreeView, { INode, flattenTree } from "react-accessible-treeview";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";
import 'bootstrap/dist/css/bootstrap.min.css';
import EntityDetail from "./components/entitydetail";

const baseAnnotation = {
  type: '',
  accuracy: '',
  numberOfImages: ''
};

export default function Page() {

  const BASE_API_PATH = process.env.NEXT_PUBLIC_BASE_API_URL;

  const [treeViewData, setTreeViewData] = useState<INode<IFlatMetadata>[]>([])
  const [selectedEntity, setSelectedEntity] = useState<INode<IFlatMetadata> | undefined>(undefined)
  const [show, setShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [creatingChild, setCreatingChild] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const [annotations, setAnnotations] = useState([baseAnnotation]);
  const [selectedEntityAnnotations, setSelectedEntityAnnotations] = useState<{[k: string]: any}>([]);

  const [newEntityName, setNewEntityName] = useState("");
  const [newEntityURLs, setNewEntityURLs] = useState("");
  const [newEntityMURLs, setNewEntityMURLs] = useState("");

  async function fetchData() {
    const response = await fetch(BASE_API_PATH + '/api/entities');
    const jsonData = await response.json();
    setTreeViewData(flattenTree({name: '', children: jsonData.categories}));
  }

  async function createEntity(
    type: string,
    name: string,
    parentId: string,
    url: string[] = [],
    murl: string[] = [],
    parentType: string = ''
  ) {
    if (parentType) {
      type = '';
    }
    const body = { type, name, parentId, url, murl, parentType };
    if (type == 'furnituretype' || parentType == 'moodboardtype') {
      // @ts-ignore
      body.annotations = annotations
        .filter(({type, accuracy, numberOfImages}) => type && accuracy && numberOfImages)
        .map(({type, accuracy, numberOfImages}) => {
          return {
            type,
            details: {
              accuracy,
              numberOfImages
            }
          }
        });
    }
    const response = await fetch(BASE_API_PATH + '/api/entities/create', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(body)
    })
    const jsonData = await response.json();
    // console.log({jsonData})
    fetchData();
  }

  async function deleteEntity(id: string) {
    const response = await fetch(BASE_API_PATH + '/api/entities/' + id, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    await response.json();
    fetchData();
  }

  async function editEntity(
    id: string,
    type: string,
    name: string,
    metadata: {[k: string]: string | string[]}
  ) {
    if (type == 'furnituretype') {
      // @ts-ignore
      metadata.annotations = annotations
        .filter(({type, accuracy, numberOfImages}) => type && accuracy && numberOfImages)
        .map(({type, accuracy, numberOfImages}) => {
          return {
            type,
            details: {
              accuracy,
              numberOfImages
            }
          }
        });
    }
    const response = await fetch(BASE_API_PATH + '/api/entities', {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ id, type, name, metadata })
    })
    const jsonData = await response.json();
    // console.log({jsonData})
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    selectedEntity && setSelectedEntity(
      treeViewData.find(tree => tree.id == selectedEntity.id)
    );
  }, [treeViewData])

  useEffect(() => {
    if (
      selectedEntity?.metadata?.entitytype == 'furnituretype' &&
      Array.isArray(selectedEntity?.metadata?.annotations)
    ) {
      const a = selectedEntity.metadata.annotations.map(({type, details}) => {
        return {
          type,
          accuracy: details.accuracy,
          numberOfImages: details.numberOfImages
        };
      });
      setSelectedEntityAnnotations(a);
      if (isEditing) {
        setAnnotations(a);
      } else {
        setAnnotations([{...baseAnnotation}]);
      }
    } else {
      setSelectedEntityAnnotations([]);
    }
  }, [selectedEntity, isEditing]);

  // useEffect(() => {
  //   // for debugging only
  //   console.log(annotations);
  // }, [annotations]);

  useEffect(() => {
    if (isEditing && selectedEntity) {
      setNewEntityName(selectedEntity.name);
      let url = selectedEntity.metadata?.url || "";
      let murl = selectedEntity.metadata?.murl || "";
      if (Array.isArray(url)) {
        //  array
        setNewEntityURLs(url.join())
      } else {
        setNewEntityURLs(url?.toString());
      }
      if (Array.isArray(murl)) {
        //  array
        setNewEntityMURLs(murl.join())
      } else {
        setNewEntityMURLs(murl?.toString());
      }
    }
  }, [isEditing, show, selectedEntity]);
  
  const handleClose = () => {
    setNewEntityName("");
    setNewEntityURLs("");
    setNewEntityMURLs("");
    setIsEditing(false);
    setHasError(false);
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const onEditEntity = () => {
    if (!selectedEntity) return;
    let id = selectedEntity.id.toString();
    let type = selectedEntity.metadata?.entitytype?.toString();
    let metadata = {
      ...selectedEntity.metadata,
      url: newEntityURLs.split(','),
      murl: newEntityMURLs.split(',')
    };
    editEntity(id, type || "", newEntityName, metadata)
    handleClose();
  }

  const onCreateEntity = () => {
    if (isEditing) {
      // call PUT API
      onEditEntity();
      return;
    }
    if (newEntityName.trim() == "") {
      setHasError(true);
      return;
    }
    if (creatingChild) {
      createEntity(
        "", 
        newEntityName.trim(), 
        selectedEntity?.id.toString() || "", 
        newEntityURLs.trim().split(","),
        newEntityMURLs.trim().split(","),
        selectedEntity?.metadata?.entitytype?.toString() || "", 
      );
    } else {
      createEntity(
        selectedEntity?.metadata?.entitytype?.toString() || "category",
        newEntityName.trim(), 
        selectedEntity?.parent?.toString() || "", 
        newEntityURLs.trim().split(","),
        newEntityMURLs.trim().split(","),
      );
    }
    handleClose();
  }

  const askDeleteConfirmation = () => {
    const resp = confirm(`Are you sure about deleting "${selectedEntity?.name}" ?`);
    if (resp && selectedEntity) {
      deleteEntity(selectedEntity.id.toString());
    }
  }

  const handleAnnotations = (event: ChangeEvent, index: number, attribute: string) => {
    const a = [...annotations];
    // @ts-ignore
    a[index][attribute] = event.target.value;
    setAnnotations(a);
  }

  const deleteAnnotation = (index: number) => {
    const a = [...annotations];
    a.splice(index, 1);
    if (a.length == 0) {
      a.push({...baseAnnotation});
    }
    setAnnotations(a);
  }

  return (
    <div className="page-container">
      <div className="tree-section">
        <DirectoryTreeView
          data={treeViewData}
          setSelectedEntity={setSelectedEntity}
        />
      </div>
      <div className="preview-form">
        {
          treeViewData.length > 0 ?
            <>
            <div>
              <div className="header-buttons">
                <Button variant="primary" onClick={() => {
                  setIsEditing(false);
                  setCreatingChild(false);
                  setModalTitle(`Create new ${selectedEntity?.metadata?.entitytype || 'Category'}`)
                  handleShow();
                }}>
                  <MdOutlineCreateNewFolder size={24} /> Create New
                </Button>
                {
                  selectedEntity && selectedEntity.metadata?.entitytype != 'furnituretype' &&
                    <Button variant="success" onClick={() => {
                      setIsEditing(false);
                      setCreatingChild(true);
                      setModalTitle(`Create child of "${selectedEntity?.name}"`)
                      handleShow();
                    }}>
                      <TiFlowChildren size={24} /> Create Child
                    </Button>
                }
                {
                  selectedEntity && (
                    <>
                      <Button variant="warning" onClick={() => {
                        setIsEditing(true);
                        setCreatingChild(false);
                        setModalTitle(`Edit "${selectedEntity?.name}"`)
                        handleShow();
                      }}>
                        <FaEdit size={24} /> Edit
                      </Button>
                      <Button variant="danger" onClick={() => {
                        setIsEditing(false);
                        setCreatingChild(true);
                        askDeleteConfirmation();
                      }}>
                        <MdDelete size={24} /> Delete
                      </Button>
                    </>
                  )
                }
              </div>
              {
                selectedEntity && <EntityDetail
                  key={selectedEntity.id}
                  id={selectedEntity.id}
                  name={selectedEntity.name}
                  type={selectedEntity.metadata?.entitytype?.toString() || ''}
                  url={selectedEntity.metadata?.url?.toString() || ''}
                  murl={selectedEntity.metadata?.murl?.toString() || ''}
                  // @ts-ignore
                  annotations={selectedEntityAnnotations}
                />
              }
            </div>
            {
              selectedEntity && <Accordion defaultActiveKey="1" flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Raw JSON</Accordion.Header>
                  <Accordion.Body>
                    <pre>
                      <code>
                        {selectedEntity && JSON.stringify(selectedEntity, undefined, 2)}
                      </code>
                    </pre>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            }
            </> : <Spinner animation="border" />
        }
        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { hasError && <Alert variant="danger">Name cannot be blank</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={newEntityName} onChange={e => {
                  setNewEntityName(e.target.value);
                  setHasError(false);
                }} placeholder="Enter name" />
            </Form.Group>
            <Form.Group>
              <Form.Label>URLs</Form.Label>
              <Form.Control
                type="text"
                value={newEntityURLs}
                onChange={e => setNewEntityURLs(e.target.value)}
                placeholder="Comma seperated URLs"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Matrices URLs</Form.Label>
              <Form.Control
                type="text"
                value={newEntityMURLs}
                onChange={e => setNewEntityMURLs(e.target.value)}
                placeholder="Comma seperated URLs"
              />
            </Form.Group>
            {
              selectedEntity?.metadata?.entitytype == 'furnituretype' &&
              <Form.Group>
                <Form.Label>Annotation</Form.Label>
                {annotations.map((annotation, index) => (
                  <div className="annotation-container"  key={`annotation-${index}`}>
                    <InputGroup className="mb-3">
                      <Form.Control
                        placeholder="Type"
                        value={annotation.type}
                        onChange={(e) => handleAnnotations(e, index, 'type')}
                      />
                      <Form.Control
                        placeholder="Accuracy"
                        value={annotation.accuracy}
                        onChange={(e) => handleAnnotations(e, index, 'accuracy')}
                      />
                      <Form.Control
                        placeholder="Number of Images"
                        value={annotation.numberOfImages}
                        onChange={(e) => handleAnnotations(e, index, 'numberOfImages')}
                      />
                    </InputGroup>
                    <MdDelete className="icon" color="red" size={32} onClick={() => deleteAnnotation(index)} />
                  </div>
                ))}
                <Button
                  variant="success"
                  onClick={() => setAnnotations([...annotations, { ...baseAnnotation }])}
                >
                  <FaPlus />Add more annotation
                </Button>
              </Form.Group>
            }
          </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={onCreateEntity}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

// const data2 = flattenTree(folder);
// console.log({data2})

function DirectoryTreeView({ data, setSelectedEntity }: {
  data: INode<IFlatMetadata>[]; 
  setSelectedEntity: Dispatch<SetStateAction<INode<IFlatMetadata> | undefined>>;
}) {
  if (!data.length) return null;
  // console.log({data})

  return (
    <div>
      <div className="directory">
        <TreeView
          data={data}
          aria-label="directory tree"
          onNodeSelect={(d) => setSelectedEntity(d.element)}
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            getNodeProps,
            level,
          }) => (
            <div {...getNodeProps()} style={{ paddingLeft: 20 * (level - 1) }}>
              {isBranch && <FolderIcon isOpen={isExpanded} />}
              <FileIcon entitytype={element.metadata?.entitytype?.toString() || ''} />
              {element.name}
            </div>
          )}
        />
      </div>
    </div>
  );
}

const FolderIcon = ({ isOpen }: { isOpen: boolean; }) =>
  isOpen ? (
    <FaRegFolderOpen color="e8a87c" className="icon" />
  ) : (
    <FaRegFolder color="e8a87c" className="icon" />
  );

const FileIcon = ({entitytype}:{entitytype: string}) => {
  switch (entitytype) {
    case "category":
      return <TbCategory color="yellow" className="icon" />;
    case "subcategory":
      return <MdOutlineCategory color="yellow" className="icon" />;
    case "moodboardtype":
      return <FaChessBoard color="yellow" className="icon" />;
    case "furnituretype":
      return <LuSofa color="red" className="icon" />;
    default:
      return null;
  }
};