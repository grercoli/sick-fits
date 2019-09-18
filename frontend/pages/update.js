import UpdateItem from '../components/UpdateItem';

const Sell = ({ query }) => (
    <div>
        <UpdateItem id={query.id} />
    </div>
);

export default Sell; //para que el id que necesito pasar como un query param sea accesible en niveles mas bajos de componentes puedo usar export default withRouter(UpdateItem)

// otra alternativa:
// const Sell = props => (
//     <div>
//         <UpdateItem id={props.query.id} />
//     </div>
// );