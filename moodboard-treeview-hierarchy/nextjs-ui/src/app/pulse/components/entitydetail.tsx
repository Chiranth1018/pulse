import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import { TfiNewWindow } from "react-icons/tfi";

interface IAnnotation {
  type: string;
  accuracy: string;
  numberOfImages: string;
}

interface IEntityDetail {
  id: string | number;
  name: string;
  url: string | string[];
  murl: string | string[];
  type: string;
  annotations: IAnnotation[];
}

export default function EntityDetail(props: IEntityDetail) {
  let urlList = Array.isArray(props.url) ? props.url : props.url.split(',');
  urlList = urlList.filter(u => !!u.trim());

  let murlList = Array.isArray(props.murl) ? props.murl : props.murl.split(',');
  murlList = murlList.filter(u => !!u.trim());
  return (
    <div style={{padding: 10}}>
      <div className='entity-title'>
        <h2>{props.name}</h2>&nbsp;&nbsp;<h5>{`(${props.type})`}</h5>
      </div>

      {
        props.annotations.length > 0 && 
        <>
          <h6>Annotations</h6>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Accuracy</th>
                <th># images</th>
              </tr>
            </thead>
            <tbody>
              {props.annotations.map(({ type, accuracy, numberOfImages }, idx) => (
                <tr key={`${type}-${idx}`}>
                  <td>{idx + 1}</td>
                  <td>{type}</td>
                  <td>{accuracy}</td>
                  <td>{numberOfImages}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      }
      { urlList.length > 0 && <URLList label='URL(s)' urlList={urlList} /> }
      <div className='spacer'/>
      { murlList.length > 0 && <URLList label='Matrices  URL(s)' urlList={murlList} /> }
      {/* <pre>{JSON.stringify(props, null, 2)}</pre> */}
    </div>
  );
}

const URLList = ({ label, urlList }: { label: string; urlList: string[] }) => {
  return (
    <>
      <h6>{label}</h6>
      <Stack gap={2}>
        {
          urlList.map((url, idx) => (
            <a style={{textDecoration: 'none'}} href={url} target='_blank' key={`${url}-${idx}`}>
              {url} <TfiNewWindow className='icon' color='black' size={16} />
            </a>
          ))
        }
      </Stack>
    </>
  );
}