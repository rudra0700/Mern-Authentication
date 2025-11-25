import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router";
import Loading from "../Loading";
import { server } from "../main";
import { useEffect } from "react";

const Verify = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useParams();

  const verifyUser = async () => {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/verify/${params.token}`
      );
      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-[200px] m-auto mt-48">
          {successMessage && (
            <p className="text-green-500 text-2xl">{successMessage}</p>
          )}{" "}
          {errorMessage && (
            <p className="text-red-500 text-2xl">{errorMessage}</p>
          )}
        </div>
      )}
    </>
  );
};

export default Verify;
