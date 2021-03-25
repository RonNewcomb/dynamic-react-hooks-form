import { getData } from "./backend/api";
import { useAsync } from "./util/useAsync";
import { Loading } from "./util/Loading";
import { ISection } from "./SuperDynamicForm/ISuperDynamicForm";
import { SuperDynamicForm } from "./SuperDynamicForm/SuperDynamicForm";

export const App = () => {
  const [formData, isLoading, noFormData] = useAsync<ISection[], typeof getData>(getData, "query", "endpoint");
  return <div>{isLoading ? <Loading /> : noFormData ? noFormData.message : <SuperDynamicForm formData={formData || []} />}</div>;
};
